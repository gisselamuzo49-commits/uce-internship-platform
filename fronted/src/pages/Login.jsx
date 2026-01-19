import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // Importamos el botón oficial
import { LogIn, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth(); // <--- TRAEMOS LA NUEVA FUNCIÓN
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 1. LOGIN NORMAL (Correo y Clave)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  // 2. LOGIN CON GOOGLE (LA SOLUCIÓN)
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    // Llamamos a la función googleLogin que creamos en AuthContext
    const res = await googleLogin(credentialResponse.credential);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Bienvenido de nuevo
          </h2>
          <p className="text-blue-100 text-sm mt-1 font-medium">
            Ingresa a tu cuenta institucional
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ejemplo@uce.edu.ec"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-xs font-bold text-slate-400 uppercase">
              O continúa con
            </span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {/* BOTÓN DE GOOGLE (LÓGICA CORREGIDA) */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Falló el inicio de sesión con Google')}
              useOneTap
              theme="outline"
              shape="pill"
              size="large"
              text="continue_with"
              width="320" // Ajuste para que ocupe el ancho
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
