import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verifyStorage() {
  console.log('=== VERIFYING SUPABASE STORAGE SETUP ===');
  
  // 1. Check Bucket existence
  const { data: bucket, error: bucketErr } = await supabase.storage.getBucket('product-images');
  const bucketExists = !!bucket && !bucketErr;
  console.log(`Bucket "product-images" exists: ${bucketExists ? 'PASS' : 'FAIL'} (${bucketErr?.message || 'Ready'})`);
  if (bucket) {
    console.log(`Bucket is public: ${bucket.public ? 'PASS' : 'FAIL'}`);
  }

  // 2. Test Anonymous Upload (MUST BE BLOCKED)
  const dummyBuffer = Buffer.from('test');
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload('unauthorized-test.txt', dummyBuffer);

  const anonWriteBlocked = !!uploadErr;
  console.log(`Anonymous write blocked: ${anonWriteBlocked ? 'PASS' : 'FAIL'} (Result: ${uploadErr?.message || 'Unexpected Success'})`);

  return {
    bucketExists,
    isPublic: bucket?.public,
    anonWriteBlocked
  };
}

verifyStorage().catch(console.error);
