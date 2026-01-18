import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  MapPin,
  FileText,
  Briefcase,
  Save,
  ArrowLeft,
} from 'lucide-react';

const NewOpportunity = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usamos authFetch para que lleve el Token y pase por el puerto 5001
      const res = await authFetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('¡Vacante publicada exitosamente!');
        navigate('/oportunidades'); // Redirigir a la lista
      } else {
        alert('Error al crear la vacante. Revisa la consola.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Briefcase className="text-blue-600" /> Nueva Vacante
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Cargo / Título
            </label>
            <div className="relative">
              <Briefcase
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                name="title"
                required
                placeholder="Ej: Desarrollador Junior"
                className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empresa */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Empresa
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-3 text-slate-400"
                  size={20}
                />
                <input
                  name="company"
                  required
                  placeholder="Ej: Banco Pichincha"
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ubicación
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-slate-400"
                  size={20}
                />
                <input
                  name="location"
                  required
                  placeholder="Ej: Quito, Av. Amazonas"
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Descripción del Puesto
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <textarea
                name="description"
                required
                rows="4"
                placeholder="Detalles de la oferta..."
                className="w-full pl-10 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              'Publicando...'
            ) : (
              <>
                <Save size={20} /> Confirmar Publicación
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewOpportunity;
