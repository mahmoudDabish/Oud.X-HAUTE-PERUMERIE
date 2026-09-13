/**
 * Verified Haute Parfumerie Olfactory Notes Dictionary
 * Provides accurate Arabic translations for recognized perfume ingredients and notes.
 */

export const OLFACTORY_NOTES_DICTIONARY: Record<string, string> = {
  // Woods & Resins
  'agarwood': 'خشب العود',
  'oud': 'عود',
  'oud wood': 'خشب العود',
  'smoked agarwood': 'عود مدخن',
  'cambodian oud': 'عود كمبودي',
  'indian oud': 'عود هندي',
  'assam oud': 'عود أسامي',
  'sandalwood': 'خشب الصندل',
  'cedarwood': 'خشب الأرز',
  'cedar': 'خشب الأرز',
  'guaiac wood': 'خشب الغاياك',
  'birch wood': 'خشب البتولا',
  'birch': 'خشب البتولا',
  'vetiver': 'نجيل الهند (فيتيفر)',
  'patchouli': 'باتشولي',
  'frankincense': 'لبان عماني',
  'omani frankincense': 'لبان عماني نقي',
  'incense': 'بخور',
  'myrrh': 'مر',
  'benzoin': 'جاوي',
  'labdanum': 'لابدانيوم',
  'elemi': 'راتنج الإيليمي',
  'amber': 'عنبر',
  'dark amber': 'عنبر داكن',
  'royal amber': 'عنبر ملكي',
  'ambergris': 'عنبر الحوت الفاخر',

  // Spices
  'saffron': 'زعفران',
  'royal saffron': 'زعفران ملكي',
  'nutmeg': 'جوزة الطيب',
  'cardamom': 'هيل',
  'green cardamom': 'هيل أخضر',
  'cinnamon': 'قرفة',
  'clove': 'قرنفل',
  'pink pepper': 'فلفل وردي',
  'black pepper': 'فلفل أسود',
  'ginger': 'زنجبيل',
  'coriander': 'كزبرة',
  'star anise': 'يانسون نجمي',

  // Florals
  'rose': 'ورد',
  'taif rose': 'ورد طائفي',
  'damask rose': 'ورد دمشقي',
  'bulgarian rose': 'ورد بلغاري',
  'turkish rose': 'ورد تركي',
  'jasmine': 'ياسمين',
  'sambac jasmine': 'فل (ياسمين سامباك)',
  'lavender': 'خزامى (لافندر)',
  'fresh lavender': 'خزامى منعشة',
  'neroli': 'نيرولي (زهر البرتقال)',
  'orange blossom': 'زهر البرتقال',
  'iris': 'سوسن',
  'orris': 'جذور السوسن (أوريس)',
  'violet': 'بنفسج',
  'geranium': 'إبرة الراعي (جيرانيوم)',
  'ylang ylang': 'يلانج يلانج',
  'ylang-ylang': 'يلانج يلانج',
  'tuberose': 'مسك الروم',
  'magnolia': 'ماغنوليا',
  'heliotrope': 'هيليوتروب',

  // Musks & Animalics
  'musk': 'مسك',
  'velvet musk': 'مسك مخملي',
  'white musk': 'مسك أبيض',
  'black musk': 'مسك أسود',
  'cashmeran': 'كشميران',
  'civet': 'زباد',
  'castoreum': 'كاستوريوم',
  'leather': 'جلد فاخر',
  'smoky leather': 'جلد مدخن',
  'suede': 'جلد سويدي مخملي',

  // Gourmand & Sweets
  'vanilla': 'فانيليا',
  'bourbon vanilla': 'فانيليا بوربون',
  'sweet vanilla': 'فانيليا حلوة',
  'tonka bean': 'حبوب التونكا',
  'tonka': 'تونكا',
  'honey': 'عسل',
  'rich honey': 'عسل فاخر',
  'coffee': 'قهوة',
  'qahwa': 'قهوة عربية',
  'qahwa coffee': 'قهوة عربية',
  'dates': 'تمر',
  'candied dates': 'تمر مسكّر',
  'praline': 'برالين',
  'caramel': 'كراميل',
  'chocolate': 'شوكولاتة داكنة',
  'cocoa': 'كاكاو',
  'almond': 'لوز',
  'cognac': 'كونياك',
  'rum': 'روم معتق',
  'tobacco': 'تبغ',
  'warm tobacco': 'تبغ دافئ',

  // Citrus & Fresh
  'bergamot': 'برغموت',
  'italian bergamot': 'برغموت إيطالي',
  'lemon': 'ليمون',
  'sicilian lemon': 'ليمون صقلي',
  'mandarin': 'يوسفي (ماندرين)',
  'orange': 'برتقال',
  'blood orange': 'برتقال أحمر',
  'grapefruit': 'جريب فروت',
  'lime': 'ليمون أخضر (لايم)',
  'mint': 'نعناع',
  'peppermint': 'نعناع فلفلي',
  'apple': 'تفاح',
  'plum': 'برقوق',
  'blackcurrant': 'كشمش أسود',
  'fig': 'تين'
};

/**
 * Clean and normalize a note string for dictionary lookup
 */
function normalizeNoteKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Translates an olfactory note from English to Arabic using the verified dictionary.
 * If not in the dictionary, gracefully returns the trimmed original string (never undefined or empty).
 */
export function translateOlfactoryNote(note: string, lang: string = 'ar'): string {
  if (!note || typeof note !== 'string') return '';
  const trimmed = note.trim();
  if (!trimmed) return '';
  if (lang !== 'ar') return trimmed;

  const normalized = normalizeNoteKey(trimmed);

  // 1. Direct dictionary match
  if (OLFACTORY_NOTES_DICTIONARY[normalized]) {
    return OLFACTORY_NOTES_DICTIONARY[normalized];
  }

  // 2. Try matching without common prefix adjectives like "fresh", "rich", "sweet", "warm", "dark"
  const strippedPrefix = normalized.replace(/^(fresh|rich|sweet|warm|dark|royal|pure|wild|deep|smoked)\s+/i, '');
  if (OLFACTORY_NOTES_DICTIONARY[strippedPrefix]) {
    // Preserve prefix nuance if recognized
    const prefixMap: Record<string, string> = {
      fresh: 'منعش',
      rich: 'غني',
      sweet: 'حلو',
      warm: 'دافئ',
      dark: 'داكن',
      royal: 'ملكي',
      pure: 'نقي',
      smoked: 'مدخن'
    };
    const prefixWord = normalized.split(' ')[0];
    const prefixArabic = prefixMap[prefixWord];
    const baseArabic = OLFACTORY_NOTES_DICTIONARY[strippedPrefix];
    if (prefixArabic) {
      return `${baseArabic} (${prefixArabic})`;
    }
    return baseArabic;
  }

  // 3. Try splitting compound notes joined with "and" or "&" (e.g. "Lavender and Mint")
  if (normalized.includes(' and ') || normalized.includes(' & ')) {
    const parts = normalized.split(/\s+(?:and|&)\s+/i);
    const translatedParts = parts.map(p => translateOlfactoryNote(p, 'ar'));
    if (translatedParts.every(Boolean)) {
      return translatedParts.join(' و');
    }
  }

  // 4. Return original trimmed string as safe fallback (never empty or undefined)
  return trimmed;
}

/**
 * Translates an array of olfactory notes into Arabic.
 * If explicit Arabic notes are provided, they take full priority.
 */
export function translateOlfactoryNotesList(
  englishNotes?: string[],
  arabicNotes?: string[],
  lang: string = 'ar'
): string[] {
  // If Arabic language and explicit Arabic notes exist and not empty, use them
  if (lang === 'ar' && Array.isArray(arabicNotes) && arabicNotes.length > 0) {
    return arabicNotes.filter(Boolean);
  }

  if (!Array.isArray(englishNotes) || englishNotes.length === 0) {
    return [];
  }

  if (lang !== 'ar') {
    return englishNotes.filter(Boolean);
  }

  return englishNotes.map(n => translateOlfactoryNote(n, 'ar')).filter(Boolean);
}
