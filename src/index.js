import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Configure API base URL for production
if (process.env.NODE_ENV === 'production') {
  // In production, API calls to /api/* should be redirected to /.netlify/functions/api/*
  window.API_BASE_URL = '/.netlify/functions/api';
} else {
  // In development, use the proxy setup
  window.API_BASE_URL = '/api';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);