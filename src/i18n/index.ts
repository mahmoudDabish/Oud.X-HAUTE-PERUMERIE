import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import commonAr from './locales/ar/common.json';

const STORAGE_KEY = 'oudx_language';

export const getSavedLanguage = (): 'en' | 'ar' => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read language preference from localStorage:', e);
  }
  return 'en';
};

export const setDocumentDirection = (lang: string) => {
  if (typeof document === 'undefined') return;
  const isArabic = lang === 'ar';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = isArabic ? 'ar' : 'en';

  if (isArabic) {
    document.documentElement.classList.add('ar-lang');
    document.body.classList.add('rtl-mode');
  } else {
    document.documentElement.classList.remove('ar-lang');
    document.body.classList.remove('rtl-mode');
  }
};

const initialLang = getSavedLanguage();
setDocumentDirection(initialLang);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: commonEn },
      ar: { common: commonAr }
    },
    defaultNS: 'common',
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('languageChanged', (lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.error('Failed to save language preference to localStorage:', e);
  }
  setDocumentDirection(lang);
});

export const switchLanguage = (lang: 'en' | 'ar') => {
  i18n.changeLanguage(lang);
};

export default i18n;
