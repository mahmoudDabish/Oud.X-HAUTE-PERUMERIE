import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function runAudit() {
  let images = [];
  for (let i = 0; i < 20; i += 3) {
    const { data, error } = await supabase
      .from('product_images')
      .select('id, product_id, url, is_main')
      .range(i, i + 2);
    if (error) {
      console.error('Audit query error:', error);
      break;
    }
    if (data && data.length > 0) {
      images.push(...data);
      if (data.length < 3) break;
    } else {
      break;
    }
  }

  let base64Rows = 0;
  let normalUrlRows = 0;
  let totalBase64Bytes = 0;

  images.forEach(img => {
    if (img.url && img.url.startsWith('data:image')) {
      base64Rows++;
      totalBase64Bytes += img.url.length;
    } else {
      normalUrlRows++;
    }
  });

  console.log('--- PHASE 1 AUDIT REPORT ---');
  console.log(`## Total image rows: ${images.length}`);
  console.log(`## Base64 image rows: ${base64Rows}`);
  console.log(`## Normal URL rows: ${normalUrlRows}`);
  console.log(`## Total Base64 payload: ${(totalBase64Bytes / (1024 * 1024)).toFixed(2)} MB (${totalBase64Bytes} bytes)`);
}

runAudit();
