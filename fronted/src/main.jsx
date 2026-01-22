import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// 1. IMPORTAMOS LAS HERRAMIENTAS DE REACT QUERY
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. CREAMOS EL "MOTOR" DE DATOS
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com">
      {/* 3. ENVOLVEMOS LA APP CON EL PROVEEDOR DE QUERY */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
