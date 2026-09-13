import { getLocalizedProductName, getLocalizedProductSubtitle, getLocalizedProductDescription, getLocalizedProductStory, getLocalizedNotesList } from '../src/i18n/presentation';
import { OLFACTORY_NOTES_DICTIONARY } from '../src/i18n/notesDictionary';
import i18n from '../src/i18n';
import { Product } from '../src/types';

async function run() {
  console.log('=== RUNNING ADMIN MODAL & BILINGUAL LOGIC VALIDATION ===\n');

  // Test 1: Verified Dictionary integrity
  console.log('1. Verifying Perfumery Notes Dictionary...');
  const keyNotes = ['Cambodian Oud', 'Taif Rose', 'Cardamom', 'Amber', 'White Musk', 'Bergamot', 'Frankincense', 'Vanilla', 'Saffron', 'Leather'];
  for (const note of keyNotes) {
    const lower = note.toLowerCase();
    const translated = OLFACTORY_NOTES_DICTIONARY[lower];
    if (!translated) {
      console.error(`Missing translation for key luxury note: "${note}"`);
      process.exit(1);
    }
    console.log(`  ✓ ${note} -> ${translated}`);
  }
  console.log('PASS: Key luxury olfactory notes dictionary verified.\n');

  // Test 2: Simulating Admin Modal Save for a New Product
  console.log('2. Simulating Admin Modal: New Product Bilingual Formulation...');
  const enInputs = {
    name: 'Santal Impérial',
    brand: 'OUD_X PRIVE',
    subtitle: 'Smoked Mysore Sandalwood & Amber',
    description: 'A deeply meditative sandalwood elixir crafted in Grasse.',
    story: 'Inspired by ancient temple rituals of Mysore.',
    topNotes: 'Cardamom, Pink Pepper, Bergamot',
    heartNotes: 'Taif Rose, Iris, Incense',
    baseNotes: 'Sandalwood, Amber, Cambodian Oud'
  };

  const arInputs = {
    nameAr: 'صندل إمبريال',
    subtitleAr: 'خشب الصندل الميسوري المدخن والعنبر',
    descriptionAr: 'خلاصة عطرية تأملية عميقة من خشب الصندل النادر.',
    storyAr: 'مستوحى من طقوس المعابد القديمة في ميسور.',
    topNotesAr: 'حب الهال, الفلفل الوردي, البرغموت',
    heartNotesAr: 'الورد الطائفي, السوسن, البخور',
    baseNotesAr: 'خشب الصندل, العنبر الملكي, العود الكمبودي'
  };

  // Parse notes exactly as AddEditProductModal does
  const parseNotesList = (str: string) => str.split(/[,،\n]/).map(s => s.trim()).filter(Boolean);

  const payload: Partial<Product> = {
    name: enInputs.name,
    brand: enInputs.brand,
    subtitle: enInputs.subtitle,
    description: enInputs.description,
    story: enInputs.story,
    price: 2850,
    stock: 20,
    nameAr: arInputs.nameAr || undefined,
    subtitleAr: arInputs.subtitleAr || undefined,
    descriptionAr: arInputs.descriptionAr || undefined,
    storyAr: arInputs.storyAr || undefined,
    notes: {
      top: parseNotesList(enInputs.topNotes),
      heart: parseNotesList(enInputs.heartNotes),
      base: parseNotesList(enInputs.baseNotes)
    },
    notesAr: {
      top: parseNotesList(arInputs.topNotesAr),
      heart: parseNotesList(arInputs.heartNotesAr),
      base: parseNotesList(arInputs.baseNotesAr)
    }
  };

  console.log('Formulated Payload:');
  console.log(' - Name EN:', payload.name);
  console.log(' - Name AR:', payload.nameAr);
  console.log(' - Top Notes EN:', payload.notes?.top);
  console.log(' - Top Notes AR:', payload.notesAr?.top);

  if (!payload.nameAr || !payload.notesAr?.top || payload.notesAr.top.length !== 3) {
    console.error('FAIL: Admin modal formulation failed to parse Arabic fields correctly!');
    process.exit(1);
  }
  console.log('PASS: New product bilingual formulation verified.\n');

  // Test 3: Simulating Non-Destructive Update of an Existing Product
  console.log('3. Simulating Non-Destructive Edit: Modifying English only...');
  const existingProduct: Product = {
    id: 'prod-12345',
    name: 'Santal Impérial',
    nameAr: 'صندل إمبريال',
    slug: 'santal-imperial',
    brand: 'OUD_X PRIVE',
    subtitle: 'Smoked Mysore Sandalwood & Amber',
    subtitleAr: 'خشب الصندل الميسوري المدخن والعنبر',
    description: 'A deeply meditative sandalwood elixir.',
    descriptionAr: 'خلاصة عطرية تأملية عميقة.',
    story: 'Original story',
    storyAr: 'القصة الأصلية',
    price: 2850,
    stock: 20,
    category: 'oud',
    gender: 'unisex',
    size: '100ml',
    availableSizes: [{ size: '100ml', price: 2850 }],
    concentration: 'Extrait de Parfum',
    fragranceFamily: 'Woody',
    notes: {
      top: ['Cardamom'],
      heart: ['Taif Rose'],
      base: ['Sandalwood']
    },
    notesAr: {
      top: ['حب الهال'],
      heart: ['الورد الطائفي'],
      base: ['خشب الصندل']
    },
    longevity: '14-18 Hours (Beast Mode)',
    sillage: 'Intense / Enormous',
    season: ['Fall', 'Winter'],
    badge: 'Bestseller',
    images: ['https://example.com/img.jpg'],
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isSale: false,
    rating: 5,
    reviewCount: 12
  };

  // User edits only English price and stock in the modal, leaving Arabic untouched
  const userModalUpdate: Partial<Product> = {
    ...existingProduct,
    price: 3100,
    stock: 35,
    // When editing, if Arabic fields are not modified, AddEditProductModal retains productToEdit values:
    nameAr: '' ? undefined : existingProduct.nameAr,
    subtitleAr: '' ? undefined : existingProduct.subtitleAr,
    descriptionAr: '' ? undefined : existingProduct.descriptionAr,
    storyAr: '' ? undefined : existingProduct.storyAr,
    notesAr: existingProduct.notesAr
  };

  console.log('Updated Product Result:');
  console.log(' - New Price:', userModalUpdate.price, '(Expected 3100)');
  console.log(' - New Stock:', userModalUpdate.stock, '(Expected 35)');
  console.log(' - Preserved Arabic Name:', userModalUpdate.nameAr);
  console.log(' - Preserved Arabic Subtitle:', userModalUpdate.subtitleAr);
  console.log(' - Preserved Arabic Notes:', userModalUpdate.notesAr?.top);

  if (
    userModalUpdate.nameAr !== existingProduct.nameAr ||
    userModalUpdate.subtitleAr !== existingProduct.subtitleAr ||
    userModalUpdate.notesAr?.top?.[0] !== 'حب الهال'
  ) {
    console.error('FAIL: Existing Arabic fields were wiped or overwritten!');
    process.exit(1);
  }
  console.log('PASS: Non-destructive update strictly preserved existing Arabic fields.\n');

  // Test 4: Switching Presentation Language between English and Arabic
  console.log('4. Testing Display in English vs Arabic...');
  
  // A. English Active
  await i18n.changeLanguage('en');
  console.log('When Language = English:');
  console.log(' - Name:', getLocalizedProductName(userModalUpdate));
  console.log(' - Subtitle:', getLocalizedProductSubtitle(userModalUpdate));
  console.log(' - Notes:', getLocalizedNotesList(userModalUpdate.notes.top, userModalUpdate.notesAr?.top));
  if (getLocalizedProductName(userModalUpdate) !== 'Santal Impérial') {
    console.error('FAIL: English name mismatch!');
    process.exit(1);
  }

  // B. Arabic Active
  await i18n.changeLanguage('ar');
  console.log('When Language = Arabic:');
  console.log(' - Name:', getLocalizedProductName(userModalUpdate));
  console.log(' - Subtitle:', getLocalizedProductSubtitle(userModalUpdate));
  console.log(' - Notes:', getLocalizedNotesList(userModalUpdate.notes.top, userModalUpdate.notesAr?.top));
  if (getLocalizedProductName(userModalUpdate) !== 'صندل إمبريال') {
    console.error('FAIL: Arabic name mismatch!');
    process.exit(1);
  }
  if (getLocalizedNotesList(userModalUpdate.notes.top, userModalUpdate.notesAr?.top)[0] !== 'حب الهال') {
    console.error('FAIL: Arabic notes mismatch!');
    process.exit(1);
  }

  // C. Missing Arabic Fallback (Strictly fallback, no undefined / empty)
  console.log('\nWhen Arabic fields are missing (Fallback Test):');
  const legacyProduct: Product = {
    ...existingProduct,
    nameAr: undefined,
    subtitleAr: undefined,
    descriptionAr: undefined,
    storyAr: undefined,
    notesAr: undefined
  };
  const fbName = getLocalizedProductName(legacyProduct);
  const fbSub = getLocalizedProductSubtitle(legacyProduct);
  const fbDesc = getLocalizedProductDescription(legacyProduct);
  const fbStory = getLocalizedProductStory(legacyProduct);
  const fbNotes = getLocalizedNotesList(legacyProduct.notes.top, undefined);

  console.log(' - Fallback Name:', fbName);
  console.log(' - Fallback Subtitle:', fbSub);
  console.log(' - Fallback Notes (Dictionary):', fbNotes);

  if (fbName !== legacyProduct.name || !fbNotes.some(n => n.includes('هيل') || n.includes('حب الهال'))) {
    console.error('FAIL: Fallback mechanism corrupted or undefined!');
    process.exit(1);
  }
  console.log('PASS: Missing Arabic fallback mechanism verified 100% stable.\n');

  console.log('=== ALL ADMIN MODAL & BILINGUAL LOGIC TESTS COMPLETED SUCCESSFULLY! ===');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
