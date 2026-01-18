import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      // Aseguramos que el email sea texto (por si el autocompletar falla)
      const emailVal = typeof email === 'object' ? email.email : email;

      const res = await login(emailVal, password);

      if (res.success) {
        navigate('/dashboard');
      } else {
        alert(res.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error inesperado de conexión');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* 1. IMAGEN DE FONDO ACTUALIZADA */}
      <div className="absolute inset-0 z-0">
        <img
          src="/teatro-uce.jpg"
          alt="Teatro Universitario UCE"
          className="w-full h-full object-cover"
        />
        {/* Capa negra semi-transparente para que se lea el texto */}
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
          CONECTA
        </p>
      </div>

      {/* 4. TARJETA DE LOGIN */}
      <div className="relative z-20 w-full max-w-md bg-[#18181b]/90 backdrop-blur-md p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10">
        <h2 className="text-3xl text-white font-bold text-center mb-8">
          Sign in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Email */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
              placeholder="ejemplo@uce.edu.ec"
              value={typeof email === 'object' ? email.email : email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo Password */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={localLoading}
            className="w-full bg-[#5b5bf0] hover:bg-[#4a4ae0] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 mt-4"
          >
            {localLoading ? 'Cargando...' : 'Sign in'}
          </button>
        </form>

        {/* Enlace a Registro */}
        <div className="mt-8 text-center border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-sm">
            ¿No tienes cuenta?{' '}
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
