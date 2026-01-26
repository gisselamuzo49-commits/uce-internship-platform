import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // <--- 1. IMPORTAMOS RHF
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 2. CONFIGURAMOS EL HOOK
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // --- LÓGICA 1: REGISTRO CON CORREO/PASSWORD ---
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // 'data' ya contiene name, email y password
      });

      const result = await res.json();

      if (res.ok) {
        alert('¡Cuenta creada con éxito! Ahora inicia sesión.');
        navigate('/login');
      } else {
        alert(result.error || 'Error al registrarse');
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA 2: REGISTRO CON GOOGLE ---
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
        window.location.href = '/dashboard';
      } else {
        alert('Error Google: ' + data.error);
      }
    } catch (error) {
      console.error('Error conexión:', error);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/teatro-uce.jpg"
          alt="Teatro Universitario UCE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="absolute top-8 left-8 z-10">
        <div className="text-white font-serif italic text-3xl font-bold tracking-tighter border-2 border-white rounded-full w-16 h-16 flex items-center justify-center">
          Uce
        </div>
      </div>

      <div className="absolute top-16 left-0 right-0 z-10 text-center text-white">
        <h1 className="text-4xl font-bold tracking-widest mb-1">SIIU</h1>
        <p className="text-sm font-light tracking-[0.3em] uppercase opacity-90">
          REGISTRO
        </p>
      </div>

      <div className="relative z-20 w-full max-w-md bg-[#18181b]/90 backdrop-blur-md p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10">
        <h2 className="text-3xl text-white font-bold text-center mb-6">
          Crear Cuenta
        </h2>

        {/* 3. CONECTAMOS EL FORMULARIO A RHF */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              // Registro con validación básica
              {...register('name', { required: 'El nombre es obligatorio' })}
              className={`w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 font-medium transition-all
                ${errors.name ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}
              `}
            />
            {errors.name && (
              <p className="text-red-400 text-[10px] ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Correo Institucional
            </label>
            <input
              type="email"
              placeholder="ejemplo@uce.edu.ec"
              {...register('email', {
                required: 'Correo requerido',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@uce\.edu\.ec$/,
                  message: 'Debe ser correo @uce.edu.ec',
                },
              })}
              className={`w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 font-medium transition-all
                ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}
              `}
            />
            {errors.email && (
              <p className="text-red-400 text-[10px] ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Crea una contraseña segura"
              {...register('password', {
                required: 'Contraseña requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              className={`w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 font-medium transition-all
                ${errors.password ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'}
              `}
            />
            {errors.password && (
              <p className="text-red-400 text-[10px] ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5b5bf0] hover:bg-[#4a4ae0] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 mt-4"
          >
            {loading ? 'Registrando...' : 'Enviar correo de verificación'}
          </button>
        </form>

        <div className="text-center border-t border-gray-700 pt-4 mt-6">
          <p className="text-gray-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-colors"
            >
              Inicia Sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
