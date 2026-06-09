// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 

// Import 2 Provider mới
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ConfirmProvider } from './context/ConfirmContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </NotificationProvider>
  </React.StrictMode>
);