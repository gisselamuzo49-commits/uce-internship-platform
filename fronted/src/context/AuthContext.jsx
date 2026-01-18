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

  // 2. Login robusto
  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('siiu_user', JSON.stringify(data.user));

        // Guardamos el token (soporta 'token' o 'access_token')
        const tokenReal = data.token || data.access_token;
        if (tokenReal) {
          localStorage.setItem('token', tokenReal);
        }

        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: 'Error de conexión con el servidor (5001)',
      };
    }
  };

  // 3. Logout
  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = '/login';
  };

  // 4. Fetch Autenticado (Con limpieza de token)
  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem('token');

    // Limpieza de seguridad: quita comillas y espacios
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

      // Si el token no sirve (401/422), cerramos sesión
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

  // --- 5. NUEVA FUNCIÓN: Actualizar usuario localmente (FALTABA ESTA) ---
  // Sirve para que el perfil se actualice sin recargar la página
  const updateLocalUser = (newData) => {
    setUser(newData);
    localStorage.setItem('siiu_user', JSON.stringify(newData));
  };

  return (
    // AGREGAMOS updateLocalUser AL VALUE
    <AuthContext.Provider
      value={{ user, login, logout, authFetch, loading, updateLocalUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
