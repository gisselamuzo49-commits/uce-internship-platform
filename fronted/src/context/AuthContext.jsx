import React, { createContext, useState, useContext, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('siiu_user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // --- HELPER PARA PETICIONES AUTENTICADAS ---
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  // --- FUNCIÓN DE LOGIN ---
  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5001/api/login', {
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

  // --- FUNCIÓN DE GOOGLE LOGIN ---
  const googleLogin = async (googleToken) => {
    try {
      const res = await fetch('http://localhost:5001/api/google-login', {
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

  // --- FUNCIÓN LOGOUT ---
  const logout = () => {
    googleLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('siiu_user');
    setUser(null);
  };

  // --- REFRESCAR USUARIO (CORREGIDO) ---
  const refreshUser = async () => {
    // Si no hay usuario en el estado, intentamos leerlo del localStorage para obtener el ID
    let currentUserId = user?.id;
    if (!currentUserId) {
      const stored = localStorage.getItem('siiu_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        currentUserId = parsed.id;
      }
    }

    if (!currentUserId) return; // Si no hay ID, no podemos refrescar

    try {
      // 👇 AQUÍ ESTABA EL ERROR: Faltaba agregar /${currentUserId}
      const res = await authFetch(
        `http://localhost:5001/api/profile/${currentUserId}`
      );

      if (res.ok) {
        const data = await res.json();
        // Actualizamos el estado y el localStorage con la info nueva (que incluye experiencias)
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
