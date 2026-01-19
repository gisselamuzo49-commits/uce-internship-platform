import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Usamos tu contexto
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos la función del contexto

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LÓGICA 1: LOGIN CON CORREO/PASSWORD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usamos la función login de tu AuthContext
      const res = await login(formData.email, formData.password);

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA 2: LOGIN CON GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:5001/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('siiu_user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        // Forzamos recarga o redirección directa
        window.location.href = '/dashboard';
      } else {
        setError('Error Google: ' + data.error);
      }
    } catch (error) {
      setError('Error de conexión con Google');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* 1. FONDO CON IMAGEN UCE (Mismo que Register) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/teatro-uce.jpg"
          alt="Teatro Universitario UCE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* 2. LOGO SUPERIOR IZQUIERDA */}
      <div className="absolute top-8 left-8 z-10">
        <div className="text-white font-serif italic text-3xl font-bold tracking-tighter border-2 border-white rounded-full w-16 h-16 flex items-center justify-center">
          Uce
        </div>
      </div>

      {/* 3. TÍTULO SUPERIOR CENTRO */}
      <div className="absolute top-16 left-0 right-0 z-10 text-center text-white">
        <h1 className="text-4xl font-bold tracking-widest mb-1">SIIU</h1>
        <p className="text-sm font-light tracking-[0.3em] uppercase opacity-90">
          LOGIN
        </p>
      </div>

      {/* 4. TARJETA DE LOGIN (Estilo Oscuro) */}
      <div className="relative z-20 w-full max-w-md bg-[#18181b]/90 backdrop-blur-md p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10">
        <h2 className="text-3xl text-white font-bold text-center mb-2">
          Bienvenido
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Ingresa tus credenciales institucionales
        </p>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Correo Institucional
            </label>
            <input
              type="email"
              placeholder="usuario@uce.edu.ec"
              required
              className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5b5bf0] hover:bg-[#4a4ae0] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 mt-2"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* --- SECCIÓN GOOGLE INTEGRADA --- */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-1/3 border-t border-gray-600"></div>
            <span className="text-xs text-gray-400 font-bold uppercase">
              O usa Google
            </span>
            <div className="w-1/3 border-t border-gray-600"></div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Login con Google falló')}
              theme="filled_black" // Tema oscuro para que combine
              shape="pill"
              text="signin_with"
              width="100%"
            />
          </div>
        </div>

        <div className="text-center border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-sm">
            ¿No tienes cuenta? {/* ENLACE CORRECTO A REGISTER */}
            <Link
              to="/register"
              className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
