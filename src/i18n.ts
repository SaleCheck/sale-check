import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import daJson from './locales/da.json';

// Fails `tsc` if da.json is missing a key or differs in shape from en.json
const da: typeof en = daJson;

export const defaultNS = 'translation';
export const supportedLanguages = ['en', 'da'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  en: { translation: en },
  da: { translation: da },
} as const;

const LANGUAGE_STORAGE_KEY = 'salecheck.language';

function isSupportedLanguage(lng: unknown): lng is SupportedLanguage {
  return supportedLanguages.includes(lng as SupportedLanguage);
}

function readStoredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(stored) ? stored : 'en';
  } catch {
    return 'en';
  }
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Storage can be unavailable (private mode, blocked site data)
  }
});

i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage(),
  fallbackLng: 'en',
  supportedLngs: supportedLanguages,
  defaultNS,
  interpolation: {
    // React already escapes rendered values
    escapeValue: false,
  },
});

export default i18n;
