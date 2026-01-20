import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  MapPin,
  AlignLeft,
  Calendar,
  Building,
  PlusCircle,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewOpportunity = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    deadline: '',
    vacancies: 1, // Por defecto 1 vacante
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('✅ Oportunidad publicada');
        navigate('/oportunidades');
      } else {
        alert('Error al publicar');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Publicar Nueva Vacante</h1>
            <p className="text-slate-400 text-sm">Define cupos y fechas.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Título
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Empresa
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Ubicación
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Fecha Límite
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>
            </div>
            {/* INPUT DE VACANTES */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                N° Vacantes
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, vacancies: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Descripción
            </label>
            <div className="relative">
              <AlignLeft
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <textarea
                rows="5"
                required
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
            >
              {loading ? '...' : 'Publicar Oportunidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewOpportunity;
