import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  AlertCircle,
  Loader,
} from 'lucide-react';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyApps = async () => {
      if (!user) return;

      const token = localStorage.getItem('token');

      if (!token) {
        setError('No se encontró sesión activa.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 👇 CAMBIO IMPORTANTE: Usamos la nueva ruta específica
        const res = await fetch(
          'http://localhost:5001/api/student/my-applications',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401)
            throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
          throw new Error('Error al obtener datos del servidor');
        }

        const data = await res.json();
        console.log('Mis Postulaciones:', data);

        // 👇 YA NO FILTRAMOS MANUALMENTE, USAMOS EL DATO DIRECTO
        setApplications(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyApps();
  }, [user]);

  // --- RENDERIZADO ---

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">
          Cargando tus postulaciones...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="p-10 flex justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle />
          {error}
        </div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Briefcase className="text-indigo-600" />
          Mis Postulaciones
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Historial de tus solicitudes a prácticas pre-profesionales.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {applications.length > 0 ? (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xl">
                  {app.company ? app.company.charAt(0) : <Building />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">
                    {app.opportunity_title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-500 text-sm mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Building size={14} /> {app.company}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {app.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${
                    app.status === 'Aprobado'
                      ? 'bg-emerald-100 text-emerald-700'
                      : app.status === 'Rechazado'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {app.status === 'Aprobado' && <CheckCircle size={14} />}
                  {app.status === 'Rechazado' && <XCircle size={14} />}
                  {(app.status === 'Pendiente' || !app.status) && (
                    <Clock size={14} />
                  )}
                  <span>{app.status || 'Pendiente'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">
              No tienes postulaciones
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
              Si acabas de postular, asegúrate de refrescar la página.
            </p>
            <Link
              to="/oportunidades"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              Ver Oportunidades <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
