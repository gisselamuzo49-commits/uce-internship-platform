import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Briefcase,
  Loader,
  FileText,
  AlertCircle,
} from 'lucide-react';

const ApplicationsAdmin = () => {
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.reverse());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setProcessingId(appId);
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
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  // --- NUEVA FUNCIÓN INTELIGENTE PARA VER CV ---
  const handleViewCV = async (studentId) => {
    const url = `http://localhost:5001/api/cv/${studentId}`;
    try {
      // 1. Preguntamos al servidor si el archivo existe (HEAD request)
      const res = await fetch(url, { method: 'HEAD' });

      if (res.ok) {
        // 2. Si existe, lo abrimos en nueva pestaña
        window.open(url, '_blank');
      } else {
        // 3. Si no existe (404), mostramos alerta bonita
        alert('⚠️ Este estudiante aún no ha cargado su Hoja de Vida.');
      }
    } catch (error) {
      alert('Error al verificar el archivo.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-8">
        Gestión de Postulaciones
      </h1>

      {loading ? (
        <div className="text-center py-10">
          <Loader className="animate-spin mx-auto text-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 font-bold">
            No hay postulaciones registradas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {app.opportunity_title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> ID: {app.student_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {app.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
                {/* --- BOTÓN MEJORADO --- */}
                {/* En lugar de <a> usamos un <button> con lógica */}
                <button
                  onClick={() => handleViewCV(app.student_id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition border border-blue-100"
                  title="Ver Hoja de Vida"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">Ver CV</span>
                </button>

                <div
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider
                    ${app.status === 'Pendiente' ? 'bg-yellow-50 text-yellow-600' : ''}
                    ${app.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-600' : ''}
                    ${app.status === 'Rechazado' ? 'bg-rose-50 text-rose-600' : ''}
                 `}
                >
                  {app.status}
                </div>

                {processingId === app.id ? (
                  <Loader size={20} className="animate-spin text-slate-400" />
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(app.id, 'Aprobado')}
                      className={`p-2 rounded-full transition-all ${
                        app.status === 'Aprobado'
                          ? 'opacity-20 cursor-default'
                          : 'hover:bg-emerald-50 text-slate-300 hover:text-emerald-600'
                      }`}
                      disabled={app.status === 'Aprobado'}
                    >
                      <CheckCircle size={24} />
                    </button>

                    <button
                      onClick={() => handleStatusChange(app.id, 'Rechazado')}
                      className={`p-2 rounded-full transition-all ${
                        app.status === 'Rechazado'
                          ? 'opacity-20 cursor-default'
                          : 'hover:bg-rose-50 text-slate-300 hover:text-rose-600'
                      }`}
                      disabled={app.status === 'Rechazado'}
                    >
                      <XCircle size={24} />
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
