import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './utils/serviceWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// shouldForwardProp function to filter out sx and other style props
const shouldForwardProp = (prop: string) =>
  !['sx', 'bg', 'p', 'px', 'py', 'm', 'mx', 'my'].includes(prop);

root.render(
  <React.StrictMode>
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StyleSheetManager>
  </React.StrictMode>
);

// Service Worker registration
serviceWorker.register({
  onSuccess: () => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: () => {
    console.log('New content is available; please refresh');
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
