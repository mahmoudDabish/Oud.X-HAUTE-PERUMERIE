import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verifyMigration() {
  console.log('=== RUNNING POST-MIGRATION COMPLETE VERIFICATION ===\n');

  // 1. Fetch all product_images rows
  let images = [];
  for (let i = 0; i < 20; i += 3) {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, product_id, url, is_main')
      .range(i, i + 2);
    if (error) {
      console.error('Error querying product_images:', error);
      break;
    }
    if (data && data.length > 0) {
      images.push(...data);
      if (data.length < 3) break;
    } else {
      break;
    }
  }

  // 2. Fetch products
  const { data: products } = await supabase.from('products').select('id, name');
  const prodMap = new Map(products?.map(p => [p.id, p.name]) || []);

  // 3. Count categories and variants to verify integrity
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: varCount } = await supabase.from('product_variants').select('*', { count: 'exact', head: true });
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

  console.log(`Total image rows found in DB: ${images.length}`);
  console.log(`Total products: ${products?.length}`);
  console.log(`Total categories preserved: ${catCount}`);
  console.log(`Total variants preserved: ${varCount}`);
  console.log(`Total orders preserved: ${orderCount}\n`);

  let base64Remaining = 0;
  let storageUrlCount = 0;
  let http200Count = 0;
  let totalNewBytes = 0;
  const results = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const isBase64 = img.url?.startsWith('data:image');
    const isStorageUrl = img.url?.includes('/storage/v1/object/public/product-images/');
    
    if (isBase64) {
      base64Remaining++;
    }
    if (isStorageUrl) {
      storageUrlCount++;
    }

    let httpStatus = 0;
    let contentType = '';
    let byteLength = 0;

    if (isStorageUrl) {
      try {
        const res = await fetch(img.url);
        httpStatus = res.status;
        contentType = res.headers.get('content-type') || '';
        const buf = await res.arrayBuffer();
        byteLength = buf.byteLength;
        totalNewBytes += byteLength;
        if (httpStatus === 200 && contentType.startsWith('image/')) {
          http200Count++;
        }
      } catch (err) {
        console.error(`HTTP check failed for ${img.id}:`, err.message);
      }
    }

    const pName = prodMap.get(img.product_id) || 'Unknown';
    results.push({
      index: i + 1,
      id: img.id,
      product_id: img.product_id,
      product_name: pName,
      isBase64,
      isStorageUrl,
      url: img.url,
      httpStatus,
      contentType,
      byteLength
    });
  }

  console.log('--- INDIVIDUAL IMAGE VERIFICATION TABLE ---');
  console.log('| # | Fragrance Name | Image ID | Storage URL | HTTP Status | Content-Type | WebP Size |');
  console.log('|---|---|---|---|---|---|---|');
  results.forEach(r => {
    const urlDisplay = r.url?.length > 60 ? `${r.url.substring(0, 50)}...` : r.url;
    console.log(`| ${r.index} | ${r.product_name} | \`${r.id.substring(0, 8)}...\` | [URL](${r.url}) | ${r.httpStatus} | ${r.contentType} | ${(r.byteLength / 1024).toFixed(1)} KB |`);
  });

  console.log('\n--- VERIFICATION METRICS SUMMARY ---');
  console.log(`Total image rows: ${images.length} (Expected: 14)`);
  console.log(`Successfully migrated: ${storageUrlCount} / 14`);
  console.log(`Base64 remaining in DB: ${base64Remaining} (Expected: 0)`);
  console.log(`HTTP 200 Image Verified: ${http200Count} / 14`);
  console.log(`Total New WebP Payload: ${(totalNewBytes / (1024 * 1024)).toFixed(2)} MB (${totalNewBytes} bytes)`);
  
  const originalBase64Bytes = 37222740;
  const reduction = ((1 - (totalNewBytes / originalBase64Bytes)) * 100).toFixed(2);
  console.log(`Payload Reduction vs Original: -${reduction}%`);
}

verifyMigration().catch(console.error);
