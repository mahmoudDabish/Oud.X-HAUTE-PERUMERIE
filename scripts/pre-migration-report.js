import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function generatePreMigrationReport() {
  let images = [];
  for (let i = 0; i < 20; i += 3) {
    const { data } = await supabase
      .from('product_images')
      .select('id, product_id, url, is_main')
      .range(i, i + 2);
    if (!data || data.length === 0) break;
    images.push(...data);
    if (data.length < 3) break;
  }

  // Fetch product names for context
  const { data: products } = await supabase.from('products').select('id, name');
  const prodMap = new Map(products?.map(p => [p.id, p.name]));

  console.log('=== PRE-MIGRATION AUDIT REPORT ===\n');
  console.log('| # | Image ID | Product ID | Product Name | MIME | Base64 Length | Decoded Size |');
  console.log('|---|---|---|---|---|---|---|');

  let totalBase64 = 0;
  let totalDecoded = 0;

  images.forEach((img, idx) => {
    const isBase64 = img.url?.startsWith('data:image');
    const mime = isBase64 ? img.url.split(';')[0].replace('data:', '') : 'url';
    const base64Len = img.url?.length || 0;
    const decodedLen = isBase64 ? Buffer.from(img.url.split(',')[1], 'base64').length : 0;
    totalBase64 += base64Len;
    totalDecoded += decodedLen;

    const pName = prodMap.get(img.product_id) || 'Unknown';
    console.log(`| ${idx + 1} | \`${img.id}\` | \`${img.product_id}\` | ${pName} | ${mime} | ${(base64Len / (1024 * 1024)).toFixed(2)} MB | ${(decodedLen / (1024 * 1024)).toFixed(2)} MB |`);
  });

  console.log(`\n**Total Images:** ${images.length}`);
  console.log(`**Total Base64 Payload:** ${(totalBase64 / (1024 * 1024)).toFixed(2)} MB (${totalBase64} characters)`);
  console.log(`**Total Decoded Binary Size:** ${(totalDecoded / (1024 * 1024)).toFixed(2)} MB (${totalDecoded} bytes)`);
}

generatePreMigrationReport();
