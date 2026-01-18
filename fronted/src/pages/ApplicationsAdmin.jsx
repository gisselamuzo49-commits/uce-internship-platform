import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, User, Briefcase, Calendar } from 'lucide-react';

const ApplicationsAdmin = () => {
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // 1. Apuntamos al puerto 5001
      // 2. Traemos TODAS las postulaciones
      const res = await authFetch('http://localhost:5001/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-8">
        Administrar Postulaciones
      </h1>

      {loading ? (
        <p>Cargando...</p>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
          <p className="text-slate-400 font-bold">
            No hay postulaciones recibidas aún.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Información del Candidato y Puesto */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {app.opportunity_title}
                  </h3>
                  <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase mt-1">
                    <span className="flex items-center gap-1">
                      <User size={12} /> Estudiante ID: {app.student_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {app.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado y Acciones */}
              <div className="flex items-center gap-4">
                <div
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider
                    ${app.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${app.status === 'Aceptado' ? 'bg-green-100 text-green-700' : ''}
                    ${app.status === 'Rechazado' ? 'bg-red-100 text-red-700' : ''}
                 `}
                >
                  {app.status}
                </div>

                {/* Botones de Acción (Solo visuales por ahora) */}
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-green-50 text-slate-300 hover:text-green-600 rounded-full transition-colors"
                    title="Aprobar"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <button
                    className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-full transition-colors"
                    title="Rechazar"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsAdmin;
