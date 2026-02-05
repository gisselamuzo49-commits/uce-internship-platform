import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// React Query for server state management
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize React Query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com">
      {/* Providers for authentication, OAuth, and data management */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
