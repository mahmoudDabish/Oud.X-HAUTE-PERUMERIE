import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use SUPABASE_SERVICE_ROLE_KEY if provided for backend migration, otherwise fallback to ANON_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'product-images';

// Helper to convert base64 image to WebP using Chromium canvas
async function convertToWebp(browser, base64Url, quality = 0.90) {
  const page = await browser.newPage();
  try {
    const result = await page.evaluate(async (dataUrl, q) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const webpData = canvas.toDataURL('image/webp', q);
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
            webpData
          });
        };
        img.onerror = () => reject(new Error('Failed to decode image in canvas'));
        img.src = dataUrl;
      });
    }, base64Url, quality);

    const base64Data = result.webpData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    return {
      buffer,
      width: result.width,
      height: result.height,
      mimeType: 'image/webp'
    };
  } finally {
    await page.close();
  }
}

async function runMigration() {
  console.log('=== OUD.X PRODUCT IMAGE MIGRATION TO SUPABASE STORAGE ===');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Using Key: ${supabaseKey.substring(0, 15)}...`);

  // Step 1: Check or create bucket
  console.log(`\nStep 1: Checking Storage bucket "${BUCKET_NAME}"...`);
  const { data: buckets, error: bucketListErr } = await supabase.storage.listBuckets();
  
  let bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`Bucket "${BUCKET_NAME}" does not exist. Creating public bucket...`);
    const { data: newBucket, error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/avif']
    });

    if (createErr) {
      console.warn('Could not create bucket via API (likely needs SQL execution in Supabase Dashboard):', createErr.message);
      console.log('\n--- REQUIRED SQL TO RUN IN SUPABASE SQL EDITOR ---');
      console.log(`
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('${BUCKET_NAME}', '${BUCKET_NAME}', true, 10485760, ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public users can view product images" ON storage.objects;
CREATE POLICY "Public users can view product images" ON storage.objects FOR SELECT USING (bucket_id = '${BUCKET_NAME}');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '${BUCKET_NAME}');

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = '${BUCKET_NAME}');

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = '${BUCKET_NAME}');
      `);
      console.log('--------------------------------------------------\n');
    } else {
      console.log(`Bucket "${BUCKET_NAME}" created successfully!`);
      bucketExists = true;
    }
  } else {
    console.log(`Bucket "${BUCKET_NAME}" is ready.`);
  }

  // Step 2: Fetch all images from product_images table safely in chunks
  console.log('\nStep 2: Fetching images from database...');
  let allImages = [];
  for (let i = 0; i < 20; i += 3) {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, product_id, url, is_main')
      .range(i, i + 2);
    if (error) {
      console.error('Error fetching image batch:', error);
      break;
    }
    if (data && data.length > 0) {
      allImages.push(...data);
      if (data.length < 3) break;
    } else {
      break;
    }
  }

  console.log(`Found ${allImages.length} image rows in product_images.`);

  // Launch Puppeteer browser instance for fast, native WebP canvas conversion
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalMigrated = 0;
  let totalFailed = 0;
  let totalUntouched = 0;
  let originalPayloadBytes = 0;
  let newStoragePayloadBytes = 0;

  try {
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      console.log(`\nProcessing [${i + 1}/${allImages.length}] ID: ${img.id} (Product: ${img.product_id})`);

      if (!img.url || !img.url.startsWith('data:image')) {
        console.log(`  Already a normal URL (${img.url.substring(0, 40)}...), skipping.`);
        totalUntouched++;
        continue;
      }

      originalPayloadBytes += img.url.length;
      const originalBinarySize = Buffer.from(img.url.split(',')[1], 'base64').length;
      console.log(`  Original Base64 Length: ${(img.url.length / (1024 * 1024)).toFixed(2)} MB (${originalBinarySize} binary bytes)`);

      // 1. Convert to high-fidelity WebP
      let optimized;
      try {
        optimized = await convertToWebp(browser, img.url, 0.90);
        console.log(`  Converted to WebP: ${optimized.width}x${optimized.height} (${(optimized.buffer.length / 1024).toFixed(1)} KB)`);
      } catch (convErr) {
        console.error(`  WebP conversion failed for ${img.id}:`, convErr.message);
        // Fallback: use raw decoded binary
        const rawMime = img.url.split(';')[0].replace('data:', '');
        const rawExt = rawMime.includes('png') ? 'png' : 'jpg';
        optimized = {
          buffer: Buffer.from(img.url.split(',')[1], 'base64'),
          mimeType: rawMime,
          ext: rawExt
        };
      }

      const fileExt = optimized.mimeType === 'image/webp' ? 'webp' : (optimized.ext || 'jpg');
      const storagePath = `${img.product_id}/${img.id}.${fileExt}`;

      // 2. Upload to Supabase Storage
      console.log(`  Uploading to storage: ${BUCKET_NAME}/${storagePath}...`);
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, optimized.buffer, {
          contentType: optimized.mimeType,
          upsert: true
        });

      if (uploadErr) {
        console.error(`  Upload FAILED for image ${img.id}:`, uploadErr.message);
        totalFailed++;
        continue;
      }

      // 3. Generate Public Storage URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      console.log(`  Generated Public URL: ${publicUrl}`);

      // 4. Verify Public URL via HTTP request before updating database
      console.log(`  Verifying public accessibility via HTTP GET...`);
      let verified = false;
      try {
        const res = await fetch(publicUrl);
        const contentType = res.headers.get('content-type') || '';
        const bodyBuf = await res.arrayBuffer();

        if (res.status === 200 && contentType.startsWith('image/') && bodyBuf.byteLength > 1000) {
          console.log(`  Verification SUCCESS: HTTP 200, ${contentType}, ${bodyBuf.byteLength} bytes.`);
          verified = true;
          newStoragePayloadBytes += bodyBuf.byteLength;
        } else {
          console.error(`  Verification FAILED: status=${res.status}, type=${contentType}, size=${bodyBuf.byteLength}`);
        }
      } catch (fetchErr) {
        console.error(`  Verification request failed:`, fetchErr.message);
      }

      // 5. Update Database Record ONLY if verified
      if (verified) {
        console.log(`  Updating product_images.url in database...`);
        const { error: updateErr } = await supabase
          .from('product_images')
          .update({ url: publicUrl })
          .eq('id', img.id);

        if (updateErr) {
          console.error(`  Database update FAILED for ${img.id}:`, updateErr.message);
          totalFailed++;
        } else {
          console.log(`  Database update SUCCESS for ${img.id}!`);
          totalMigrated++;
        }
      } else {
        console.warn(`  Leaving database row untouched because verification failed.`);
        totalFailed++;
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== MIGRATION SUMMARY ===');
  console.log(`Total records: ${allImages.length}`);
  console.log(`Successfully migrated: ${totalMigrated}`);
  console.log(`Failed / Untouched: ${totalFailed}`);
  console.log(`Original Base64 Payload: ${(originalPayloadBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`New Storage Payload: ${(newStoragePayloadBytes / (1024 * 1024)).toFixed(2)} MB`);
  if (originalPayloadBytes > 0) {
    const reduction = ((1 - (newStoragePayloadBytes / originalPayloadBytes)) * 100).toFixed(1);
    console.log(`Payload Reduction: ${reduction}%`);
  }
}

runMigration().catch(console.error);
