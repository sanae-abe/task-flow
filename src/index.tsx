import React from 'react';
import ReactDOM from 'react-dom/client';

// 本番環境でのReact 19互換性対策
if (typeof window !== 'undefined') {
  // Reactをグローバルに設定（use-callback-ref等の依存ライブラリ用）
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ React initialized:', {
      version: React.version,
      useLayoutEffect: typeof React.useLayoutEffect !== 'undefined',
    });
  }
}
import { BrowserRouter } from 'react-router-dom';

// Prism.jsは使用時に動的ロード（初期バンドルサイズ削減）
// loadPrism()をRichTextEditor内で呼び出す

import './index.css';
import './i18n/config'; // i18n初期化
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './utils/serviceWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// BrowserRouter使用（Vercel環境での標準的なルーティング）
// React 19.2.0の互換性問題のため、本番環境ではStrictMode無効化
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>{app}</React.StrictMode>
  ) : (
    app
  )
);

// Service Worker registration - PWA機能を有効化
serviceWorker.register({
  onSuccess: () => {
    console.log('[PWA] Content is cached for offline use.');
  },
  onUpdate: registration => {
    console.log('[PWA] New content is available. Please refresh to update.');

    // カスタムイベントを発火して、アプリケーションに通知
    window.dispatchEvent(
      new CustomEvent('sw-update', { detail: registration })
    );
  },
  onOfflineReady: () => {
    console.log('[PWA] App is ready to work offline.');
  },
  onError: error => {
    console.error('[PWA] Service Worker registration failed:', error);
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
