import dotenv from 'dotenv';
dotenv.config();

// Ensure process.env matches Vite's import.meta.env expectations if needed
(globalThis as any).importMetaEnv = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

import { productService } from '../src/services/productService';
import { supabase } from '../src/lib/supabaseClient';
import { getLocalizedProductName, getLocalizedProductSubtitle, getLocalizedProductDescription, getLocalizedProductStory, getLocalizedNotesList } from '../src/i18n/presentation';
import i18n from '../src/i18n';

async function runTest() {
  console.log('=== STARTING BILINGUAL READ/WRITE PERSISTENCE TEST ===');
  
  const { data: catList } = await supabase.from('categories').select('id').limit(1);
  const validCatId = catList?.[0]?.id;

  const testSlug = `test-bilingual-elixir-${Date.now()}`;
  const newProductData = {
    name: 'Imperial Oud Privé',
    nameAr: 'عود إمبريال بريفيه',
    subtitle: 'Extrait de Parfum - Vintage Royal Reserve',
    subtitleAr: 'خلاصة عطرية نقية - الإصدار الملكي المعتّق',
    description: 'A dark smoky Cambodian agarwood blended with Taif rose and amber.',
    descriptionAr: 'خشب العود الكمبودي المعتق المدخن الممزوج مع الورد الطائفي الفاخر والعنبر الملكي.',
    story: 'Conceived in the private sanctuary of Grasse and aged in French oak.',
    storyAr: 'صُمم في ملاذ غراس الخاص وعُتّق في براميل البلوط الفرنسي النادر.',
    brand: 'OUD_X PRIVE',
    price: 3450,
    compareAtPrice: 4200,
    stock: 12,
    categoryId: validCatId,
    category: 'oud',
    gender: 'unisex' as const,
    concentration: 'Extrait de Parfum' as const,
    fragranceFamily: 'Smoky Oud',
    longevity: '14-18 Hours (Beast Mode)' as const,
    sillage: 'Intense / Enormous' as const,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'],
    size: '100ml',
    availableSizes: [{ size: '100ml', price: 3450, inStock: true }],
    notes: {
      top: ['Cardamom', 'Pink Pepper', 'Bergamot'],
      heart: ['Taif Rose', 'Incense', 'Amber'],
      base: ['Cambodian Oud', 'Cedarwood', 'Leather']
    },
    notesAr: {
      top: ['حب الهال', 'الفلفل الوردي', 'البرغموت'],
      heart: ['الورد الطائفي', 'البخور الملكي', 'العنبر'],
      base: ['العود الكمبودي', 'خشب الأرز', 'الجلد الفاخر']
    }
  };

  console.log(`\n1. Creating new product: "${newProductData.name}" (${newProductData.nameAr})...`);
  const { data: created, error: createError } = await productService.createProduct(newProductData);
  if (createError || !created) {
    console.error('FAILED to create product:', createError);
    process.exit(1);
  }
  console.log('Product created successfully! ID:', created.id, 'Slug:', created.slug);

  console.log('\n2. Reading back product from Supabase by slug...');
  const { data: fetched, error: fetchError } = await productService.getProductBySlug(created.slug);
  if (fetchError || !fetched) {
    console.error('FAILED to fetch created product:', fetchError);
    process.exit(1);
  }

  console.log('Verifying fetched fields:');
  console.log(' - Name (EN):', fetched.name);
  console.log(' - Name (AR):', fetched.nameAr);
  console.log(' - Subtitle (EN):', fetched.subtitle);
  console.log(' - Subtitle (AR):', fetched.subtitleAr);
  console.log(' - Description (AR):', fetched.descriptionAr);
  console.log(' - Story (AR):', fetched.storyAr);
  console.log(' - Top Notes (AR):', fetched.notesAr?.top);

  if (fetched.name !== newProductData.name || fetched.nameAr !== newProductData.nameAr) {
    console.error('MISMATCH in product name!');
    process.exit(1);
  }
  if (!fetched.notesAr?.top || fetched.notesAr.top[0] !== 'حب الهال') {
    console.error('MISMATCH in Arabic notes!');
    process.exit(1);
  }
  console.log('PASS: Creation and retrieval of Arabic and English fields verified!');

  console.log('\n3. Testing Presentation Localization (Language = AR)...');
  await i18n.changeLanguage('ar');
  const arName = getLocalizedProductName(fetched);
  const arSub = getLocalizedProductSubtitle(fetched);
  const arDesc = getLocalizedProductDescription(fetched);
  const arStory = getLocalizedProductStory(fetched);
  const arNotes = getLocalizedNotesList(fetched.notes.top, fetched.notesAr?.top);

  console.log(' - Localized AR Name:', arName);
  console.log(' - Localized AR Subtitle:', arSub);
  console.log(' - Localized AR Description:', arDesc);
  console.log(' - Localized AR Story:', arStory);
  console.log(' - Localized AR Top Notes:', arNotes.join(', '));

  if (arName !== newProductData.nameAr || arSub !== newProductData.subtitleAr) {
    console.error('MISMATCH in AR presentation helpers!');
    process.exit(1);
  }
  console.log('PASS: AR presentation confirmed accurate!');

  console.log('\n4. Testing Fallback when Arabic fields are missing (no guessing / undefined)...');
  const dummyProductWithoutAr = {
    ...fetched,
    nameAr: undefined,
    subtitleAr: undefined,
    descriptionAr: undefined,
    storyAr: undefined,
    notesAr: undefined
  };
  const fallbackName = getLocalizedProductName(dummyProductWithoutAr);
  const fallbackSub = getLocalizedProductSubtitle(dummyProductWithoutAr);
  const fallbackDesc = getLocalizedProductDescription(dummyProductWithoutAr);
  const fallbackStory = getLocalizedProductStory(dummyProductWithoutAr);
  // Dictionary lookup for 'Cardamom', 'Pink Pepper', 'Bergamot'
  const fallbackNotes = getLocalizedNotesList(dummyProductWithoutAr.notes.top, undefined);

  console.log(' - Fallback Name (Must equal EN name):', fallbackName);
  console.log(' - Fallback Subtitle (Must equal EN subtitle):', fallbackSub);
  console.log(' - Fallback Notes (Dictionary translated):', fallbackNotes.join(', '));

  if (fallbackName !== dummyProductWithoutAr.name || fallbackSub !== dummyProductWithoutAr.subtitle) {
    console.error('MISMATCH in fallback mechanism!');
    process.exit(1);
  }
  if (!fallbackNotes.includes('حب الهال') && !fallbackNotes.includes('الهيل')) {
    console.error('MISMATCH in dictionary translation of Cardamom:', fallbackNotes);
    process.exit(1);
  }
  console.log('PASS: Fallback to original English and dictionary notes verified!');

  console.log('\n5. Testing Update: Updating price and stock WITHOUT wiping Arabic fields...');
  const { data: updated, error: updateError } = await productService.updateProduct(fetched.id, {
    price: 3600,
    stock: 15,
    // Note: nameAr, descriptionAr, etc. are NOT passed, meaning they must be preserved!
  });
  if (updateError || !updated) {
    console.error('FAILED to update product:', updateError);
    process.exit(1);
  }

  const { data: refetched } = await productService.getProductBySlug(fetched.slug);
  console.log('Refetched after update:');
  console.log(' - Updated Price:', refetched?.price, '(Expected 3600)');
  console.log(' - Updated Stock:', refetched?.stock, '(Expected 15)');
  console.log(' - Preserved Arabic Name:', refetched?.nameAr, `(Expected "${newProductData.nameAr}")`);
  console.log(' - Preserved Arabic Subtitle:', refetched?.subtitleAr);
  console.log(' - Preserved Arabic Notes:', refetched?.notesAr?.top);

  if (refetched?.nameAr !== newProductData.nameAr || !refetched?.notesAr?.top) {
    console.error('FAILED: Arabic fields were wiped or corrupted during partial update!');
    process.exit(1);
  }
  console.log('PASS: Partial updates safely preserve all Arabic content!');

  console.log('\n6. Cleaning up test product from Supabase...');
  const { error: deleteError } = await productService.deleteProduct(fetched.id);
  if (deleteError) {
    console.warn('Cleanup note: could not delete test product:', deleteError.message);
  } else {
    console.log('Test product cleanly removed from database.');
  }

  console.log('\n=== ALL BILINGUAL PERSISTENCE & LOCALIZATION TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
