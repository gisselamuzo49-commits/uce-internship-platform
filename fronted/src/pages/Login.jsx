import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // <--- 1. IMPORTAMOS RHF
import { Mail, Lock, EyeOff, Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // 2. CONFIGURAMOS EL HOOK
  // Eliminamos el useState de formData. RHF se encarga ahora.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Mantenemos estos estados para la lógica de API y UI
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. NUEVA FUNCIÓN DE SUBMIT
  // Recibe 'data' automáticamente con { email: '...', password: '...' }
  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');

    const res = await login(data.email, data.password);

    if (res.success) navigate('/dashboard');
    else {
      setApiError(res.error || 'Credenciales incorrectas');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const res = await googleLogin(credentialResponse.credential);
    if (res.success) navigate('/dashboard');
    else {
      setApiError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* 1. FONDO TEATRO UCE */}
      <div className="absolute inset-0 z-0">
        <img
          src="/teatro-uce.jpg"
          alt="Teatro UCE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75"></div>
      </div>

      {/* 2. LOGO UCE IZQUIERDA */}
      <div className="absolute top-10 left-10 z-10">
        <div className="text-white font-serif italic text-4xl font-light border-2 border-white rounded-full w-14 h-14 flex items-center justify-center">
          Uce
        </div>
      </div>

      {/* 3. TÍTULO SIIU */}
      <div className="relative z-10 text-center text-white mb-8">
        <h1 className="text-4xl font-bold tracking-tight">SIIU</h1>
        <p className="text-xs font-medium tracking-[0.4em] uppercase opacity-80">
          ACADÉMICO
        </p>
      </div>

      {/* 4. TARJETA DE LOGIN */}
      <div className="relative z-20 w-full max-w-[420px] bg-[#1e2329] p-10 rounded-[2rem] shadow-2xl border border-white/5 animate-fade-in">
        <h2 className="text-2xl text-white font-semibold text-center mb-8">
          Sign in
        </h2>

        {/* MOSTRAR ERROR DE API SI EXISTE */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-bold">
            {apiError}
          </div>
        )}

        {/* 5. FORMULARIO CONECTADO A RHF */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* --- EMAIL --- */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs ml-1 font-bold uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="example@uce.edu.ec"
              // CONEXIÓN AL HOOK:
              {...register('email', { required: true })}
              className={`w-full bg-[#d9d9d9] text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 font-medium placeholder-gray-500
                ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}
              `}
            />
            {/* Feedback visual discreto */}
            {errors.email && (
              <span className="text-red-400 text-[10px] ml-1">Requerido</span>
            )}
          </div>

          {/* --- PASSWORD --- */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs ml-1 font-bold uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter at least 8+ characters"
                // CONEXIÓN AL HOOK:
                {...register('password', { required: true, minLength: 8 })}
                className={`w-full bg-[#d9d9d9] text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 font-medium placeholder-gray-500
                  ${errors.password ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}
                `}
              />
              <EyeOff
                className="absolute right-3 top-3.5 text-gray-500"
                size={18}
              />
            </div>
            {errors.password && (
              <span className="text-red-400 text-[10px] ml-1">
                Mínimo 8 caracteres
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              {/* Checkbox también se puede registrar si quisieras guardar la preferencia */}
              <input
                type="checkbox"
                {...register('remember')}
                className="accent-indigo-500"
              />{' '}
              Recordarme
            </label>
            <Link to="#" className="hover:text-white transition">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center"
          >
            {loading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      {/* 5. SECCIÓN GOOGLE (No cambia, solo se queda visualmente igual) */}
      <div className="relative z-20 w-full max-w-[420px] mt-8 text-center">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            or continue with
          </span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <div className="relative inline-block overflow-hidden rounded-full">
          {/* DISEÑO DEL BOTÓN */}
          <div className="flex items-center bg-[#4d4d4d] py-1 pl-1 pr-10 rounded-full shadow-lg pointer-events-none">
            <div className="bg-white p-2 rounded-full flex items-center justify-center shadow-md">
              {/* SVG DE GOOGLE (Resumido para no ocupar espacio visual aquí, es el mismo tuyo) */}
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span className="text-white font-medium ml-4 text-lg">
              Sign up with Google
            </span>
          </div>

          <div className="absolute inset-0 opacity-0 cursor-pointer">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setApiError('Google Login Failed')}
              useOneTap
              width="300"
            />
          </div>
        </div>
      </div>

      <p className="relative z-20 mt-8 text-gray-500 text-xs font-medium">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-indigo-400 font-bold ml-1">
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default Login;
