import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with update callback that notifies the app
serviceWorkerRegistration.register({
  onUpdate: registration => {
    const event = new CustomEvent('sw-update-available', { detail: registration });
    window.dispatchEvent(event);
  }
});