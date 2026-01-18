import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, Briefcase } from 'lucide-react';

const MyApplications = () => {
  const { user, authFetch } = useAuth();
  const [myApps, setMyApps] = useState([]);

  useEffect(() => {
    const fetchMyApps = async () => {
      try {
        // CORRECCIÓN 1: Puerto 5001
        // CORRECCIÓN 2: Usamos la ruta genérica '/api/applications'
        const res = await authFetch('http://localhost:5001/api/applications');

        if (res.ok) {
          const allApps = await res.json();
          // CORRECCIÓN 3: Filtramos aquí en el frontend
          // Mostramos solo las que coinciden con el ID del usuario logueado
          const filteredApps = allApps.filter(
            (app) => String(app.student_id) === String(user.id)
          );
          setMyApps(filteredApps);
        }
      } catch (error) {
        console.error('Error conectando al 5001:', error);
      }
    };
    if (user) fetchMyApps();
  }, [user]);

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tight">
        Mis Postulaciones
      </h1>

      <div className="grid gap-4">
        {myApps.length > 0 ? (
          myApps.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {app.opportunity_title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                    Aplicado el: {app.date}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${
                  app.status === 'Aprobado'
                    ? 'bg-emerald-50 text-emerald-600'
                    : app.status === 'Rechazado'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-amber-50 text-amber-600'
                }`}
              >
                {app.status === 'Aprobado' && <CheckCircle size={14} />}
                {app.status === 'Rechazado' && <XCircle size={14} />}
                {app.status === 'Pendiente' && <Clock size={14} />}
                {app.status || 'Pendiente'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold mb-2">
              No tienes postulaciones activas.
            </p>
            <a
              href="/oportunidades"
              className="text-blue-600 font-bold hover:underline"
            >
              Ir a buscar ofertas
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
