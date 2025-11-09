import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Prism.jsをアプリ起動時にプリロード開始（RichTextEditorの遅延ロードに備える）
// @lexical/codeがCodeNode/CodeHighlightNode初期化時にwindow.Prismを必要とするため
import { loadPrism } from './utils/prismLoader';

// Sentry初期化（本番環境のみ）
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // パフォーマンス監視のサンプリングレート（10%のトランザクションを記録）
    tracesSampleRate: 0.1,
    // セッションリプレイのサンプリングレート
    replaysSessionSampleRate: 0.1, // 通常セッションの10%
    replaysOnErrorSampleRate: 1.0, // エラー時は100%記録
    // 個人情報のフィルタリング
    beforeSend(event) {
      // Cookie情報の削除
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      // IPアドレスの削除
      if (event.user?.ip_address) {
        event.user.ip_address = null;
      }
      return event;
    },
  });
}

// Prismのプリロードを開始（非ブロッキング）
loadPrism().catch(error => {
  console.warn('[App] Prism preload failed, will retry on demand:', error);
});

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
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <App />
      </Sentry.ErrorBoundary>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>
);

// Error Boundaryのフォールバックコンポーネント
function ErrorFallback() {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>エラーが発生しました</h1>
      <p>申し訳ございません。予期しないエラーが発生しました。</p>
      <p>ページを再読み込みしてください。</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        ページを再読み込み
      </button>
    </div>
  );
}

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
