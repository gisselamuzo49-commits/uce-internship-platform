import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
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
import Notification from '../components/Notification';
// Centralized API URL import
import { API_URL } from '../config/api';

const NewOpportunity = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { vacancies: 1, type: 'pasantia' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = { ...data, vacancies: parseInt(data.vacancies) };

    try {
      const res = await authFetch(`${API_URL}/api/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNotification({
          message: '✅ Oferta publicada correctamente',
          type: 'success',
        });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setNotification({ message: '❌ Error al publicar.', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: '❌ Error de conexión.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 relative min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
          <PlusCircle size={24} />
          <h1 className="text-2xl font-black">Publicar Nueva Vacante</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Opportunity type selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Tipo de Oferta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="pasantia"
                  {...register('type')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border border-slate-200 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700 flex items-center gap-2 hover:bg-slate-50">
                  <Briefcase size={18} />{' '}
                  <span className="font-bold text-sm">Prácticas</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="vinculacion"
                  {...register('type')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border border-slate-200 peer-checked:bg-teal-50 peer-checked:border-teal-500 peer-checked:text-teal-700 flex items-center gap-2 hover:bg-slate-50">
                  <Users size={18} />{' '}
                  <span className="font-bold text-sm">Vinculación</span>
                </div>
              </label>
            </div>
          </div>

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
                  {...register('title', { required: true })}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl"
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
                  {...register('company', { required: true })}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl"
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
                  {...register('location', { required: true })}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl"
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
                  {...register('deadline', { required: true })}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Vacantes
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  min="1"
                  {...register('vacancies', { required: true })}
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl"
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
                {...register('description', { required: true })}
                className="w-full pl-10 p-3 bg-slate-50 border rounded-xl"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewOpportunity;
