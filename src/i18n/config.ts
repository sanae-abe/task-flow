import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import jaTranslation from './locales/ja.json';
import enTranslation from './locales/en.json';

const resources = {
  ja: {
    translation: jaTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

// SSR対応: ブラウザ環境でのみLanguageDetectorを使用
const i18nInstance = i18n.use(initReactI18next);

if (typeof window !== 'undefined') {
  i18nInstance.use(LanguageDetector);
}

i18nInstance.init({
  resources,
  fallbackLng: 'ja',
  defaultNS: 'translation',
  debug: process.env.NODE_ENV === 'development',
  lng: typeof window !== 'undefined' ? undefined : 'ja', // SSR時は明示的に'ja'
  interpolation: {
    escapeValue: false,
  },
  ...(typeof window !== 'undefined' && {
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'taskflow-language',
    },
  }),
});

export default i18n;
