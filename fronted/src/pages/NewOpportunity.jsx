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
// 1. IMPORTAMOS TU COMPONENTE DE NOTIFICACIONES
import Notification from '../components/Notification';

const NewOpportunity = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 2. ESTADO PARA CONTROLAR LA NOTIFICACIÓN
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    deadline: '',
    vacancies: 1,
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null); // Limpiamos notificaciones previas

    try {
      const res = await authFetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // 3. ÉXITO: MENSAJE VERDE (type: 'success')
        setNotification({
          message: '✅ Oportunidad publicada correctamente',
          type: 'success',
        });

        // Esperamos 2 segundos para que el usuario lea el mensaje antes de cambiar de página
        setTimeout(() => {
          navigate('/oportunidades');
        }, 2000);
      } else {
        // 4. ERROR: MENSAJE ROJO (type: 'error')
        setNotification({
          message: '❌ Error al publicar la oportunidad. Intenta de nuevo.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error(error);
      setNotification({
        message: '❌ Error de conexión con el servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 relative">
      {/* 5. AQUÍ RENDERIZAMOS LA NOTIFICACIÓN SI EXISTE */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

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
                  value={formData.vacancies}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Publicando...' : 'Publicar Oportunidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOpportunity;
