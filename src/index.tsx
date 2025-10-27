// import React from 'react'; // StrictMode無効時は不要
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import * as serviceWorker from './utils/serviceWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// HashRouter使用（S3環境での確実なルーティング）

root.render(
  // <React.StrictMode> - 一時的に無効化（React Hooks初期化問題のデバッグ用）
    <HashRouter>
      <App />
    </HashRouter>
  // </React.StrictMode>
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
