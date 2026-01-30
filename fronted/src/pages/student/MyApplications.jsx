import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  Search,
} from 'lucide-react';

const MyApplications = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  // --- 1. CARGA DE DATOS ---
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      // Usa la variable de entorno o localhost por defecto
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      // Petición al backend
      const res = await authFetch(`${baseUrl}/api/student/my-applications`);

      if (!res.ok) {
        throw new Error('Error al obtener tus postulaciones');
      }

      const data = await res.json();
      console.log('📦 Postulaciones recibidas:', data); // <--- MIRA ESTO EN CONSOLA (F12)
      return data;
    },
    refetchOnWindowFocus: true,
  });

  // --- 2. HELPERS VISUALES ---
  const getStatusBadge = (status) => {
    // Normalizamos a minúsculas para evitar errores (Ej: "Aprobado" vs "aprobado")
    const lowerStatus = status?.toLowerCase() || 'pendiente';

    if (lowerStatus === 'aprobado' || lowerStatus === 'aceptado') {
      return (
        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200">
          <CheckCircle size={14} /> Aprobado
        </span>
      );
    } else if (lowerStatus === 'rechazado') {
      return (
        <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-rose-200">
          <XCircle size={14} /> Rechazado
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-200">
          <Clock size={14} /> Pendiente
        </span>
      );
    }
  };

  // --- 3. RENDERIZADO ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">
          Cargando tus postulaciones...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 max-w-md shadow-sm">
          <h3 className="font-bold text-lg mb-2">Error de conexión</h3>
          <p className="text-sm text-red-500 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Mis Postulaciones
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Estado de tus solicitudes actuales.
          </p>
        </div>
        <button
          onClick={() => navigate('/practicas')} // Ajusta esta ruta si se llama '/ofertas'
          className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
        >
          <Search size={18} /> Buscar más ofertas
        </button>
      </div>

      {/* CONTENIDO */}
      {applications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Briefcase size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Aún no tienes postulaciones
          </h3>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            Cuando apliques a una oferta de práctica o vinculación, aparecerá
            aquí para que puedas seguir su estado.
          </p>
          <Link
            to="/practicas"
            className="text-blue-600 font-bold hover:underline hover:text-blue-700 bg-blue-50 px-6 py-3 rounded-xl transition"
          >
            Ver Ofertas Disponibles &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app, index) => (
            <div
              key={app.id || index}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              {/* Barra lateral de color según estado */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                  app.status?.toLowerCase() === 'aprobado'
                    ? 'bg-emerald-500'
                    : app.status?.toLowerCase() === 'rechazado'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                }`}
              />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-4">
                <div className="flex-1">
                  {/* Badge de Estado y Fecha */}
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Calendar size={12} />
                      {/* Intenta leer 'date' o 'fecha_postulacion' o muestra la de hoy */}
                      {app.date ||
                        app.fecha_postulacion ||
                        new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Título (Con fallback por si el nombre varía en BD) */}
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {app.opportunity_title ||
                      app.titulo ||
                      app.cargo ||
                      'Cargo no especificado'}
                  </h3>

                  {/* Detalles (Empresa y Tipo) */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mt-2">
                    <span className="flex items-center gap-1.5">
                      <Building size={16} className="text-slate-400" />{' '}
                      {app.company || app.empresa || 'Empresa confidencial'}
                    </span>

                    {/* Renderiza el tipo solo si existe */}
                    {(app.type || app.tipo) && (
                      <span className="flex items-center gap-1 uppercase text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 tracking-wider">
                        {app.type || app.tipo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
