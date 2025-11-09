import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from './LanguageSwitcher';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(() => Promise.resolve()),
      language: 'ja',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

const renderWithLanguageProvider = (component: React.ReactElement) =>
  render(<LanguageProvider>{component}</LanguageProvider>);

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();
  });

  it('デフォルトで日本語が表示される', () => {
    renderWithLanguageProvider(<LanguageSwitcher />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('言語切り替えボタンをクリックするとドロップダウンが開く', async () => {
    const user = userEvent.setup();
    renderWithLanguageProvider(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: '言語切り替え' });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('Englishを選択すると言語が切り替わる', async () => {
    const user = userEvent.setup();
    renderWithLanguageProvider(<LanguageSwitcher />);

    // ドロップダウンを開く
    const button = screen.getByRole('button', { name: '言語切り替え' });
    await user.click(button);

    // Englishを選択
    const englishOption = await screen.findByRole('menuitemradio', {
      name: /English/i,
    });
    await user.click(englishOption);

    // 言語が切り替わったことを確認
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('言語選択がlocalStorageに保存される', async () => {
    const user = userEvent.setup();
    renderWithLanguageProvider(<LanguageSwitcher />);

    // ドロップダウンを開く
    const button = screen.getByRole('button', { name: '言語切り替え' });
    await user.click(button);

    // Englishを選択
    const englishOption = await screen.findByRole('menuitemradio', {
      name: /English/i,
    });
    await user.click(englishOption);

    // localStorageに保存されたことを確認
    await waitFor(() => {
      expect(localStorage.getItem('taskflow-language')).toBe('en');
    });
  });

  it('選択中の言語にチェックマークが表示される', async () => {
    const user = userEvent.setup();
    renderWithLanguageProvider(<LanguageSwitcher />);

    // ドロップダウンを開く
    const button = screen.getByRole('button', { name: '言語切り替え' });
    await user.click(button);

    // 日本語のラジオアイテムが選択されていることを確認
    const japaneseOption = await screen.findByRole('menuitemradio', {
      name: /日本語/i,
    });
    expect(japaneseOption).toHaveAttribute('data-state', 'checked');
  });

  it('言語切り替え後もドロップダウンが正しく動作する', async () => {
    const user = userEvent.setup();
    renderWithLanguageProvider(<LanguageSwitcher />);

    // 1回目: Englishに切り替え
    const button = screen.getByRole('button', { name: '言語切り替え' });
    await user.click(button);

    const englishOption = await screen.findByRole('menuitemradio', {
      name: /English/i,
    });
    await user.click(englishOption);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    // 2回目: 日本語に戻す
    await user.click(button);

    const japaneseOption = await screen.findByRole('menuitemradio', {
      name: /日本語/i,
    });
    await user.click(japaneseOption);

    await waitFor(() => {
      expect(screen.getByText('日本語')).toBeInTheDocument();
    });
  });
});
