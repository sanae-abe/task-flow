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

// BrowserRouter使用（Vercel環境での標準的なルーティング）

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
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
