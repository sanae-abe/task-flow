import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// SSR対応: ブラウザ環境でのみLanguageDetectorとHttpBackendを使用
const i18nInstance = i18n.use(initReactI18next);

if (typeof window !== 'undefined') {
  i18nInstance.use(LanguageDetector).use(HttpBackend);
}

i18nInstance.init({
  fallbackLng: 'ja',
  defaultNS: 'translation',
  debug: process.env.NODE_ENV === 'development',
  lng: typeof window !== 'undefined' ? undefined : 'ja', // SSR時は明示的に'ja'
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: true, // Suspenseで遅延ロード対応
  },
  ...(typeof window !== 'undefined' && {
    backend: {
      loadPath: '/locales/{{lng}}.json', // 動的ロードパス
      requestOptions: {
        cache: 'default',
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'taskflow-language',
    },
  }),
});

export default i18n;
