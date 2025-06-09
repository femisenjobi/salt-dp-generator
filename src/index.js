import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './AuthContext'; // Import AuthProvider

// Configure API base URL
window.API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : '/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);