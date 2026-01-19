import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar usuario al iniciar
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

  // 2. Login Normal (Email/Pass)
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

  // --- 3. NUEVA FUNCIÓN: LOGIN CON GOOGLE (¡ESTA FALTABA!) ---
  const googleLogin = async (googleToken) => {
    try {
      console.log('Enviando token a Backend...'); // Debug
      const res = await fetch('http://localhost:5001/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      // AQUÍ ES DONDE SUELE DAR EL ERROR '<' SI EL BACKEND FALLA
      const data = await res.json();

      if (res.ok) {
        saveSession(data); // Reutilizamos la lógica de guardar
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Error al validar con Google',
        };
      }
    } catch (error) {
      console.error('Error Google Auth:', error);
      return { success: false, error: 'Error de conexión con el servidor.' };
    }
  };

  // Función auxiliar para guardar datos (DRY)
  const saveSession = (data) => {
    setUser(data.user);
    localStorage.setItem('siiu_user', JSON.stringify(data.user));
    const tokenReal = data.token || data.access_token;
    if (tokenReal) {
      localStorage.setItem('token', tokenReal);
    }
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
      if (response.status === 401 || response.status === 422) {
        console.warn('Sesión expirada. Cerrando sesión...');
        logout();
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

  return (
    // ¡IMPORTANTE! Agregamos googleLogin al value para que Login.jsx pueda usarlo
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        logout,
        authFetch,
        loading,
        updateLocalUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
