import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../src/lib/supabaseClient';

async function check() {
  const { data, error } = await supabase
    .from('products')
    .select('name_ar, subtitle_ar, description_ar, story_ar, notes_ar')
    .limit(1);

  if (error) {
    console.log('MIGRATION_STATUS: NOT_APPLIED');
    console.log('Error details:', error);
  } else {
    console.log('MIGRATION_STATUS: APPLIED_SUCCESSFULLY');
    console.log('Sample data:', data);
  }
}

check();
