import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Building, FileText } from 'lucide-react';

const NewOpportunity = () => {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Usamos authFetch para enviar el Token de Admin automáticamente
      // 2. Apuntamos al PUERTO 5001
      const res = await authFetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Vacante publicada exitosamente!');
        navigate('/oportunidades'); // Te devuelve a la lista
      } else {
        alert('Error: ' + (data.error || 'No se pudo publicar'));
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor (Puerto 5001)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">
        Publicar Nueva Vacante
      </h1>
      <p className="text-slate-500 mb-8">
        Completa la información para que los estudiantes se postulen.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6"
      >
        {/* Título del Puesto */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
            <Briefcase size={16} /> Título del Puesto
          </label>
          <input
            type="text"
            placeholder="Ej: Desarrollador Junior React"
            required
            className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
              <Building size={16} /> Empresa
            </label>
            <input
              type="text"
              placeholder="Ej: Banco Pichincha"
              required
              className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
              <MapPin size={16} /> Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej: Quito / Remoto"
              required
              className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
            <FileText size={16} /> Descripción Breve
          </label>
          <textarea
            rows="4"
            placeholder="Detalles sobre las responsabilidades y requisitos..."
            className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 resize-none"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0f172a] hover:bg-blue-700 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-lg transition-all transform active:scale-95"
        >
          {loading ? 'Publicando...' : 'Confirmar Publicación'}
        </button>
      </form>
    </div>
  );
};

export default NewOpportunity;
