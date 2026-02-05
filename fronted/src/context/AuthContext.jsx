import React, { createContext, useState, useContext, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';

// Centralized API URL import
import { API_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('siiu_user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helper for authenticated API requests
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  // User login with email and password
  const login = async (email, password) => {
    try {
      // 👇 USAMOS API_URL IMPORTADA
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('siiu_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        return {
          success: false,
          error: data.error || 'Error al iniciar sesión',
        };
      }
    } catch (error) {
      console.error('Error Login:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // Google OAuth login
  const googleLogin = async (googleToken) => {
    try {
      // 👇 USAMOS API_URL IMPORTADA
      const res = await fetch(`${API_URL}/api/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('siiu_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión Google' };
    }
  };

  // Logout and clear authentication
  const logout = () => {
    googleLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('siiu_user');
    setUser(null);
  };

  // Refresh user profile from API
  const refreshUser = async () => {
    let currentUserId = user?.id;
    if (!currentUserId) {
      const stored = localStorage.getItem('siiu_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        currentUserId = parsed.id;
      }
    }

    if (!currentUserId) return;

    try {
      // 👇 USAMOS API_URL IMPORTADA
      const res = await authFetch(`${API_URL}/api/profile/${currentUserId}`);

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('siiu_user', JSON.stringify(data));
        setUser(data);
      } else {
        console.error('Error refrescando perfil:', res.status);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        logout,
        authFetch,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
