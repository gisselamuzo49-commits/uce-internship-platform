import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form'; // <--- 1. IMPORTAMOS EL HOOK
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

const NewOpportunity = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // 2. INICIALIZAMOS REACT HOOK FORM
  // 'register': Para conectar los inputs
  // 'handleSubmit': Para manejar el envío
  // 'formState': Para ver errores
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vacancies: 1, // Valor inicial para vacantes
    },
  });

  // 3. FUNCIÓN DE ENVÍO (Ya recibe los datos limpios 'data')
  const onSubmit = async (data) => {
    setLoading(true);
    setNotification(null);

    try {
      const res = await authFetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Enviamos la data directa de la librería
      });

      if (res.ok) {
        setNotification({
          message: '✅ Oportunidad publicada correctamente',
          type: 'success',
        });
        setTimeout(() => {
          navigate('/oportunidades');
        }, 2000);
      } else {
        setNotification({
          message: '❌ Error al publicar. Intenta de nuevo.',
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

        {/* 4. CONECTAMOS EL FORMULARIO */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* --- TITULO --- */}
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
                  // 5. REGISTRO DEL INPUT (Reemplaza value y onChange)
                  {...register('title', { required: true })}
                  className={`w-full pl-10 p-3 bg-slate-50 border rounded-xl ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                />
              </div>
              {errors.title && (
                <span className="text-red-500 text-xs mt-1">Requerido</span>
              )}
            </div>

            {/* --- EMPRESA --- */}
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
                  className={`w-full pl-10 p-3 bg-slate-50 border rounded-xl ${errors.company ? 'border-red-500' : 'border-slate-200'}`}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* --- UBICACIÓN --- */}
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
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* --- FECHA --- */}
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
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>
            </div>

            {/* --- VACANTES --- */}
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
                  {...register('vacancies', { required: true, min: 1 })}
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* --- DESCRIPCIÓN --- */}
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
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
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
