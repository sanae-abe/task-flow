import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(() => Promise.resolve()),
      language: 'ja',
    },
  }),
}));

describe('LanguageContext', () => {
  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();
  });

  it('デフォルトで日本語が設定される', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    expect(result.current.language).toBe('ja');
  });

  it('localStorageから言語設定を読み込む', () => {
    // localStorageに英語を設定
    localStorage.setItem('taskflow-language', 'en');

    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    expect(result.current.language).toBe('en');
  });

  it('setLanguageで言語を変更できる', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
  });

  it('言語変更時にlocalStorageに保存される', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(localStorage.getItem('taskflow-language')).toBe('en');
  });

  it('無効な言語設定がlocalStorageにある場合はデフォルト値を使用', () => {
    // 無効な値を設定
    localStorage.setItem('taskflow-language', 'invalid');

    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    expect(result.current.language).toBe('ja');
  });

  it('Provider外でuseLanguageを使用するとエラーが発生', () => {
    // エラーを無視するためのコンソールモック
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useLanguage());
    }).toThrow('useLanguage must be used within a LanguageProvider');

    console.error = originalError;
  });

  it('言語を複数回変更できる', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    // 日本語 → 英語
    act(() => {
      result.current.setLanguage('en');
    });
    expect(result.current.language).toBe('en');

    // 英語 → 日本語
    act(() => {
      result.current.setLanguage('ja');
    });
    expect(result.current.language).toBe('ja');

    // 再度英語に
    act(() => {
      result.current.setLanguage('en');
    });
    expect(result.current.language).toBe('en');
  });
});
