import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Briefcase,
  Loader,
} from 'lucide-react';

const ApplicationsAdmin = () => {
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para saber qué botón está "pensando" (loading)
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/applications');
      if (res.ok) {
        const data = await res.json();
        // Mostrar las más recientes primero
        setApplications(data.reverse());
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN QUE ACTIVA LOS BOTONES ---
  const handleStatusChange = async (appId, newStatus) => {
    setProcessingId(appId); // Activar spinner de carga
    try {
      const res = await authFetch(
        `http://localhost:5001/api/applications/${appId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        // Actualizar la interfaz INMEDIATAMENTE sin recargar la página
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        alert('No se pudo actualizar el estado.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      setProcessingId(null); // Desactivar spinner
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-8">
        Gestionar Postulaciones
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <Loader className="animate-spin mx-auto text-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 font-bold">
            No hay postulaciones pendientes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md"
            >
              {/* Info del Candidato */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {app.opportunity_title}
                  </h3>
                  <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> ID Est: {app.student_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {app.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* LÓGICA DE ESTADO Y BOTONES */}
              <div className="flex items-center gap-6">
                {/* Etiqueta de Estado (Cambia de color según estado) */}
                <div
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider
                    ${app.status === 'Pendiente' ? 'bg-yellow-50 text-yellow-600' : ''}
                    ${app.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-600' : ''}
                    ${app.status === 'Rechazado' ? 'bg-rose-50 text-rose-600' : ''}
                 `}
                >
                  {app.status}
                </div>

                {/* CONTROLES (Solo aparecen si está procesando o si puedes cambiarlo) */}
                {processingId === app.id ? (
                  <Loader size={24} className="animate-spin text-blue-500" />
                ) : (
                  <div className="flex gap-2">
                    {/* Botón APROBAR (Check) */}
                    <button
                      onClick={() => handleStatusChange(app.id, 'Aprobado')}
                      className={`p-2 rounded-full transition-all border ${
                        app.status === 'Aprobado'
                          ? 'bg-emerald-100 text-emerald-600 border-emerald-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-200 text-slate-300 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                      disabled={app.status === 'Aprobado'}
                      title="Aprobar"
                    >
                      <CheckCircle size={24} strokeWidth={2.5} />
                    </button>

                    {/* Botón RECHAZAR (X) */}
                    <button
                      onClick={() => handleStatusChange(app.id, 'Rechazado')}
                      className={`p-2 rounded-full transition-all border ${
                        app.status === 'Rechazado'
                          ? 'bg-rose-100 text-rose-600 border-rose-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-500 hover:bg-rose-50'
                      }`}
                      disabled={app.status === 'Rechazado'}
                      title="Rechazar"
                    >
                      <XCircle size={24} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsAdmin;
