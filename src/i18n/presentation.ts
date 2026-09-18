import i18n from './index';
import { Product } from '../types';
import { translateOlfactoryNote, translateOlfactoryNotesList } from './notesDictionary';

export const CATEGORY_ID_MAP: Record<string, string> = {
  'all': 'categories.all',
  '11111111-1111-1111-1111-111111111111': 'categories.perfumes',
  '22222222-2222-2222-2222-222222222222': 'categories.bodySplash',
  '33333333-3333-3333-3333-333333333333': 'categories.oud',
  '44444444-4444-4444-4444-444444444444': 'categories.bodySpray',
  '55555555-5555-5555-5555-555555555555': 'categories.giftSets',
  // String name fallbacks if stored directly
  'Perfumes': 'categories.perfumes',
  'Body Splash': 'categories.bodySplash',
  'Oud': 'categories.oud',
  'Body Spray': 'categories.bodySpray',
  'Body Care': 'categories.bodySpray',
  'body-spray': 'categories.bodySpray',
  'body-care': 'categories.bodySpray',
  'Gift Sets': 'categories.giftSets',
  'gift-set': 'categories.giftSets'
};

export type TranslationFn = (key: any, ...args: any[]) => any;

const defaultT: TranslationFn = (k: string, defaultVal?: string): string => {
  return (i18n.t(k, { defaultValue: defaultVal }) as string) || defaultVal || k;
};

export const getLocalizedCategory = (categoryVal: string, t: TranslationFn = defaultT): string => {
  if (!categoryVal) return '';
  const key = CATEGORY_ID_MAP[categoryVal];
  if (key) {
    return t(key);
  }
  return categoryVal;
};

export const getLocalizedGender = (gender: string, t: TranslationFn = defaultT): string => {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'men') return t('gender.men', 'Men');
  if (g === 'women') return t('gender.women', 'Women');
  if (g === 'unisex') return t('gender.unisex', 'Unisex');
  return gender;
};

export const getLocalizedFragranceFamily = (family: string, t: TranslationFn = defaultT): string => {
  if (!family) return '';
  const f = family.toLowerCase();
  if (f.includes('smoky') || f.includes('oud')) return t('fragranceFamily.smokyOud', family);
  if (f.includes('gourmand')) return t('fragranceFamily.amberGourmand', family);
  if (f.includes('oriental') || f.includes('woody')) return t('fragranceFamily.orientalWoody', family);
  if (f.includes('leather')) return t('fragranceFamily.spicyLeather', family);
  if (f.includes('floral') || f.includes('citrus')) return t('fragranceFamily.floralCitrus', family);
  if (f.includes('fougere')) return t('fragranceFamily.aromaticFougere', family);
  if (f.includes('resin')) return t('fragranceFamily.warmResin', family);
  return family;
};

export const getLocalizedConcentration = (conc: string, t: TranslationFn = defaultT): string => {
  if (!conc) return '';
  if (conc.includes('Extrait')) return t('concentration.extrait', 'Extrait de Parfum');
  if (conc.includes('Eau de Parfum')) return t('concentration.edp', 'Eau de Parfum');
  if (conc.includes('Attar') || conc.includes('Oil')) return t('concentration.attar', 'Parfum Oil (Attar)');
  if (conc.includes('Elixir')) return t('concentration.elixir', 'Elixir');
  return conc;
};

export const getLocalizedBadge = (badge: string, t: TranslationFn = defaultT): string => {
  if (!badge) return '';
  const b = badge.toUpperCase();
  if (b === 'BEST SELLER') return t('badges.bestSeller', 'BEST SELLER');
  if (b === 'NEW') return t('badges.new', 'NEW');
  if (b === 'LIMITED') return t('badges.limited', 'LIMITED');
  if (b === 'SALE') return t('badges.sale', 'SALE');
  if (b === 'EXCLUSIVE') return t('badges.exclusive', 'EXCLUSIVE');
  return badge;
};

export const getLocalizedOrderStatus = (status: string, t: TranslationFn = defaultT): string => {
  if (!status) return '';
  switch (status) {
    case 'Processing':
      return t('orderStatus.processing', 'Processing');
    case 'Shipped':
      return t('orderStatus.shipped', 'Shipped');
    case 'Out for Delivery':
      return t('orderStatus.outForDelivery', 'Out for Delivery');
    case 'Delivered':
      return t('orderStatus.delivered', 'Delivered');
    case 'Cancelled':
      return t('orderStatus.cancelled', 'Cancelled');
    default:
      return status;
  }
};

export const getLocalizedPaymentMethod = (method: string, t: TranslationFn = defaultT): string => {
  if (!method) return '';
  if (method === 'Card' || method.includes('Card')) return t('paymentMethod.card', 'Credit / Debit Card');
  if (method === 'Instapay') return t('paymentMethod.instapay', 'Instapay');
  if (method === 'COD' || method.includes('Cash')) return t('paymentMethod.cod', 'Cash on Delivery');
  return method;
};

export const getLocalizedGovernorate = (gov: string, t: TranslationFn = defaultT): string => {
  if (!gov) return '';
  const key = `governorates.${gov}`;
  return t(key, gov);
};

export const formatPriceLocalized = (amount: number, lang: string = i18n.language): string => {
  const isAr = lang === 'ar';
  let num = (amount || 0).toLocaleString(isAr ? 'ar-EG' : 'en-EG');
  if (isAr) {
    num = num.replace(/[\u066C\u060C]/g, ',');
  }
  return isAr ? `${num} ج.م` : `${num} EGP`;
};

export const formatDateLocalized = (dateStr: string, lang: string = i18n.language): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

/**
 * Returns the localized product name.
 * Strictly adheres to user constraints:
 * - If Arabic: uses explicit stored product.nameAr if available.
 * - Otherwise falls back cleanly to original product.name or fallbackName.
 * - Never machine translates or guesses product names; never returns undefined.
 */
export const getLocalizedProductName = (
  product?: Partial<Product> | null,
  fallbackName?: string,
  lang: string = i18n.language
): string => {
  if (!product && !fallbackName) return '';
  const isAr = lang === 'ar';
  if (isAr && product?.nameAr && product.nameAr.trim()) {
    return product.nameAr.trim();
  }
  return product?.name || fallbackName || '';
};

/**
 * Returns localized product subtitle / olfactory slogan.
 */
export const getLocalizedProductSubtitle = (
  product?: Partial<Product> | null,
  fallbackSubtitle?: string,
  lang: string = i18n.language
): string => {
  if (!product && !fallbackSubtitle) return '';
  const isAr = lang === 'ar';
  if (isAr && product?.subtitleAr && product.subtitleAr.trim()) {
    return product.subtitleAr.trim();
  }
  return product?.subtitle || fallbackSubtitle || '';
};

/**
 * Returns localized editorial description.
 * Explicit Arabic when stored, otherwise original description fallback.
 */
export const getLocalizedProductDescription = (
  product?: Partial<Product> | null,
  fallbackDesc?: string,
  lang: string = i18n.language
): string => {
  if (!product && !fallbackDesc) return '';
  const isAr = lang === 'ar';
  if (isAr && product?.descriptionAr && product.descriptionAr.trim()) {
    return product.descriptionAr.trim();
  }
  return product?.description || fallbackDesc || '';
};

/**
 * Returns localized heritage/artisan story.
 */
export const getLocalizedProductStory = (
  product?: Partial<Product> | null,
  fallbackStory?: string,
  lang: string = i18n.language
): string => {
  if (!product && !fallbackStory) return '';
  const isAr = lang === 'ar';
  if (isAr && product?.storyAr && product.storyAr.trim()) {
    return product.storyAr.trim();
  }
  return product?.story || fallbackStory || '';
};

/**
 * Localizes an array of notes (top, heart, base).
 * Uses explicit stored Arabic notes if provided, otherwise uses the verified dictionary.
 * Safely handles strings and arrays.
 */
export const getLocalizedNotesList = (
  englishNotes?: string[] | string,
  arabicNotes?: string[] | string,
  lang: string = i18n.language
): string[] => {
  const normEn = Array.isArray(englishNotes)
    ? englishNotes
    : typeof englishNotes === 'string'
      ? englishNotes.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  const normAr = Array.isArray(arabicNotes)
    ? arabicNotes
    : typeof arabicNotes === 'string'
      ? arabicNotes.split(/[،,]/).map(s => s.trim()).filter(Boolean)
      : undefined;

  return translateOlfactoryNotesList(normEn, normAr, lang);
};

export { translateOlfactoryNote };

export const getLocalizedLongevity = (longevity: string, t: TranslationFn = defaultT): string => {
  if (!longevity) return '';
  if (longevity.includes('14-18') || longevity.includes('Beast')) {
    return t('longevity.14_18', '14-18 Hours (Beast Mode)');
  }
  if (longevity.includes('12+')) {
    return t('longevity.12_plus', '12+ Hours');
  }
  if (longevity.includes('8-10')) {
    return t('longevity.8_10', '8-10 Hours');
  }
  if (longevity.includes('6-8')) {
    return t('longevity.6_8', '6-8 Hours');
  }
  return longevity;
};

export const getLocalizedSillage = (sillage: string, t: TranslationFn = defaultT): string => {
  if (!sillage) return '';
  if (sillage.includes('Intense') || sillage.includes('Enormous')) {
    return t('sillage.intense', 'Intense / Enormous');
  }
  if (sillage.includes('Heavy')) {
    return t('sillage.heavy', 'Heavy');
  }
  if (sillage.includes('Moderate')) {
    return t('sillage.moderate', 'Moderate');
  }
  if (sillage.includes('Intimate')) {
    return t('sillage.intimate', 'Intimate');
  }
  return sillage;
};

