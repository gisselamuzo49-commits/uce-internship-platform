import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('siiu_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // IMPORTANTE: Puerto 5001
      const res = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('siiu_user', JSON.stringify(data.user));
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return {
        success: false,
        error:
          'Error de conexión (Asegúrate que Docker corre en el puerto 5001)',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.replace('/login');
  };

  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logout();
        return response;
      }

      // IMPORTANTE: Puerto 5001 para refrescar token
      const refreshRes = await fetch('http://localhost:5001/api/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (refreshRes.ok) {
        const { access_token } = await refreshRes.json();
        localStorage.setItem('access_token', access_token);
        headers['Authorization'] = `Bearer ${access_token}`;
        return await fetch(url, { ...options, headers });
      } else {
        logout();
      }
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authFetch, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
