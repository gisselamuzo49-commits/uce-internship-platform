import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar usuario al iniciar (TU LÓGICA ORIGINAL)
  useEffect(() => {
    const storedUser = localStorage.getItem('siiu_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error leyendo usuario guardado:', e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // 2. Login Normal
  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        saveSession(data);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión (5001)' };
    }
  };

  // 3. Login Google
  const googleLogin = async (googleToken) => {
    try {
      const res = await fetch('http://localhost:5001/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (res.ok) {
        saveSession(data);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error Google' };
      }
    } catch (error) {
      console.error('Error Google Auth:', error);
      return { success: false, error: 'Error de conexión.' };
    }
  };

  // Helper para guardar sesión
  const saveSession = (data) => {
    setUser(data.user);
    localStorage.setItem('siiu_user', JSON.stringify(data.user));
    const token = data.token || data.access_token;
    localStorage.setItem('token', token);
  };

  // 4. Logout
  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = '/login';
  };

  // 5. Fetch Autenticado
  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem('token');
    if (token) {
      token = token.replace(/^"|"$/g, '').trim();
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    try {
      let response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        console.warn('Sesión caducada (401). Cerrando sesión...');
        logout();
      }
      if (response.status === 500) {
        console.error('Error interno del servidor (500).');
      }
      return response;
    } catch (error) {
      console.error('Error de red:', error);
      throw error;
    }
  };

  const updateLocalUser = (newData) => {
    setUser(newData);
    localStorage.setItem('siiu_user', JSON.stringify(newData));
  };

  // --- NUEVA FUNCIÓN AGREGADA: REFRESCAR USUARIO ---
  // Esta función pide los datos nuevos al backend y actualiza la pantalla sin recargar
  const refreshUser = async () => {
    if (!user) return;
    try {
      // Usamos tu authFetch para asegurar que lleva el token
      const res = await authFetch(
        `http://localhost:5001/api/profile/${user.id}`
      );
      if (res.ok) {
        const freshData = await res.json();
        // Usamos tu función existente para guardar en memoria y localStorage
        updateLocalUser(freshData);
        console.log('Datos refrescados correctamente');
      }
    } catch (error) {
      console.error('Error al refrescar usuario', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        logout,
        authFetch,
        loading,
        updateLocalUser,
        refreshUser, // <--- ¡AQUÍ EXPORTAMOS LA FUNCIÓN MÁGICA!
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
