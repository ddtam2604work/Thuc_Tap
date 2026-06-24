// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App.jsx';
import './index.css'; 

// Import 2 Provider mới
import { NotificationProvider } from './src/context/NotificationContext.jsx';
import { ConfirmProvider } from './src/context/ConfirmContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </NotificationProvider>
  </React.StrictMode>
);