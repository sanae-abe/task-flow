// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// localStorage mock
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

global.localStorage = new LocalStorageMock() as Storage;

// react-i18next mock with translation map
const translations: Record<string, string> = {
  // Priority translations
  'priority.priority': '優先度',
  'priority.critical': '緊急',
  'priority.criticalDesc': '今すぐ対応が必要',
  'priority.high': '高',
  'priority.highDesc': '近日中に対応が必要',
  'priority.medium': '中',
  'priority.mediumDesc': '通常の優先度',
  'priority.low': '低',
  'priority.lowDesc': '時間があるときに対応',
  'priority.noPriority': '選択なし',
  'priority.noPriorityDesc': '優先度を設定しない',
  'priority.unset': '未設定',
  'priority.ariaLabel': '優先度',
  // Attachment translations
  'attachment.attachment': '添付ファイル',
  'attachment.fileAttachment': 'ファイル添付',
  'attachment.addAttachment': 'ファイルを追加',
  'attachment.removeAttachment': 'ファイルを削除',
  'attachment.noAttachments': '添付ファイルがありません',
  'attachment.maxSizeLabel': '最大{{size}}MB',
  'attachment.dragDrop': 'ファイルをドラッグ&ドロップ',
  'attachment.dragDropOrClick':
    'ファイルをここにドラッグ＆ドロップするか、クリックして選択',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translation = translations[key] || key;
      if (params && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (_, k) =>
          params[k] !== undefined && params[k] !== null ? String(params[k]) : ''
        );
      }
      return translation;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: 'ja',
    },
  }),
  Trans: ({ children }: any) => children,
  I18nextProvider: ({ children }: any) => children,
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// =========================================
// グローバルエラーハンドラー（Claude Code用）
// =========================================
const collectedErrors: Array<{
  type: 'console' | 'unhandled' | 'promise';
  message: string;
  stack?: string;
  timestamp: number;
}> = [];

// コンソールエラーのインターセプト
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.map((arg) => String(arg)).join(' ');

  // React の警告など、意図的なエラーは除外
  const isExpectedError =
    message.includes('Warning: ReactDOM.render') ||
    message.includes('Warning: useLayoutEffect') ||
    message.includes('act(...)');

  if (!isExpectedError) {
    collectedErrors.push({
      type: 'console',
      message,
      timestamp: Date.now(),
    });
  }

  originalConsoleError.apply(console, args);
};

// 未処理エラーのキャッチ
globalThis.addEventListener?.('error', (event: ErrorEvent) => {
  collectedErrors.push({
    type: 'unhandled',
    message: event.message,
    stack: event.error?.stack,
    timestamp: Date.now(),
  });
});

// 未処理のPromise拒否をキャッチ
globalThis.addEventListener?.('unhandledrejection', (event: PromiseRejectionEvent) => {
  collectedErrors.push({
    type: 'promise',
    message: String(event.reason),
    timestamp: Date.now(),
  });
});

// テスト終了時にエラーレポート出力
if (typeof afterAll !== 'undefined') {
  afterAll(() => {
    if (collectedErrors.length > 0) {
      console.log('\n========== 収集されたエラー（Claude Code検出用） ==========');
      collectedErrors.forEach((error, index) => {
        console.log(`\n[${index + 1}] ${error.type.toUpperCase()} エラー`);
        console.log(`時刻: ${new Date(error.timestamp).toISOString()}`);
        console.log(`メッセージ: ${error.message}`);
        if (error.stack) {
          console.log(`スタックトレース:\n${error.stack}`);
        }
      });
      console.log('=========================================================\n');
    }
  });
}

// テスト環境でのエラー取得用ヘルパー（グローバル変数として公開）
(globalThis as any).__getCollectedErrors = () => [...collectedErrors];
(globalThis as any).__clearCollectedErrors = () => {
  collectedErrors.length = 0;
};
