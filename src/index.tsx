import React from 'react';
import ReactDOM from 'react-dom/client';

// 本番環境でのReact初期化エラー対策（緊急修正 - 最終版）
if (typeof window !== 'undefined') {
  // 既存のプレースホルダーを実際のReactで置換
  console.log('Replacing React placeholder with real React');

  // Reactをグローバルスコープに強制設定
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;

  // より確実にReactを設定
  if (!(window as any).React || typeof (window as any).React.useLayoutEffect !== 'function') {
    (window as any).React = React;
  }

  // use-callback-refライブラリ用のReact確保
  if (!React.useLayoutEffect) {
    console.error('React.useLayoutEffect is not available');
  } else {
    console.log('✅ React.useLayoutEffect is available');
  }

  // 強制的にReactを全てのrequire/importで利用可能にする
  if (typeof global !== 'undefined') {
    (global as any).React = React;
  }

  // AMD/CommonJS環境への対応
  if (typeof module !== 'undefined' && module.exports) {
    (module.exports as any).React = React;
  }

  console.log('🚀 Final React fix applied:', {
    ReactAvailable: typeof React !== 'undefined',
    useLayoutEffectAvailable: typeof React.useLayoutEffect !== 'undefined',
    windowReact: typeof window.React !== 'undefined',
    windowReactType: typeof window.React,
    useLayoutEffectType: typeof React.useLayoutEffect
  });
}
import { HashRouter } from 'react-router-dom';

// Prism.jsをグローバルに初期化（Lexical CodeHighlightPluginが依存）
import Prism from 'prismjs';
import 'prismjs/components/prism-markup.js'; // HTML, XML, SVG
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js'; // JSX support
import 'prismjs/components/prism-tsx.js'; // TSX support
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-markdown.js';

// Prismをグローバルwindowオブジェクトに明示的に設定（@lexical/code が window.Prism を期待）
if (typeof window !== 'undefined') {
  (window as typeof window & { Prism: typeof Prism }).Prism = Prism;
}

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import * as serviceWorker from './utils/serviceWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// HashRouter使用（S3環境での確実なルーティング）

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// Service Worker registration - temporarily disabled for debugging
// serviceWorker.register({
//   onSuccess: () => {
//     // Service Worker registered successfully
//   },
//   onUpdate: () => {
//     // New content is available; please refresh
//   },
// });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
