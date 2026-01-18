import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // IMPORTANTE: Puerto 5001
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Cuenta creada! Inicia sesión.');
        navigate('/login');
      } else {
        alert(data.error || 'Error al registrarse');
      }
    } catch (error) {
      alert('Error de conexión (Puerto 5001)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* 1. FONDO CON IMAGEN UCE (Igual que en Login) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/teatro-uce.jpg"
          alt="Teatro Universitario UCE"
          className="w-full h-full object-cover"
        />
        {/* Capa oscura para que resalte el formulario */}
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
          REGISTRO
        </p>
      </div>

      {/* 4. TARJETA DE REGISTRO (Estilo Oscuro) */}
      <div className="relative z-20 w-full max-w-md bg-[#18181b]/90 backdrop-blur-md p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10">
        <h2 className="text-3xl text-white font-bold text-center mb-8">
          Crear Cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              required
              className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-gray-300 text-xs ml-1 font-bold uppercase tracking-wider">
              Correo Institucional
            </label>
            <input
              type="email"
              placeholder="ejemplo@uce.edu.ec"
              required
              className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
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
              placeholder="Crea una contraseña segura"
              required
              className="w-full bg-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-gray-500 transition-all"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5b5bf0] hover:bg-[#4a4ae0] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 mt-6"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-700 pt-6">
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
