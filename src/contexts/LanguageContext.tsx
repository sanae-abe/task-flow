import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = 'taskflow-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  const [language, setLanguageState] = useState<Language>(() => {
    // SSR対応: localStorageが利用可能かチェック
    if (typeof window === 'undefined') {
      return 'ja'; // SSR時はデフォルト値
    }
    // localStorage から初期値を取得
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ja' || stored === 'en') {
      return stored;
    }
    // デフォルトは日本語
    return 'ja';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    // SSR対応: localStorageが利用可能な場合のみ保存
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    }
    // i18nextの言語も変更
    i18n.changeLanguage(newLanguage);
  };

  useEffect(() => {
    // 初回マウント時にi18nextの言語を設定
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
