import React from 'react';
import ReactDOM from 'react-dom/client';
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

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
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
