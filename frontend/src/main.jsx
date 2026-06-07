// --- WebRTC POLYFILLS (STRICTLY FIRST: MUST LOAD BEFORE REACT) ---
import { Buffer } from 'buffer';

// simple-peer and WebRTC internal libraries expect 'process' and 'global' to exist
window.global = window;
window.Buffer = Buffer;
window.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (cb) => setTimeout(cb, 0),
  browser: true,
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);