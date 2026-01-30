import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Building,
  Calendar,
  ArrowRight,
  Loader,
  CheckCircle,
} from 'lucide-react';

const Opportunities = ({ type }) => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient(); // Para actualizar datos automáticamente

  // 1. CARGAR OPORTUNIDADES
  const {
    data: opportunities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const res = await authFetch('http://localhost:5001/api/opportunities');
      if (!res.ok) throw new Error('Error al cargar');
      return res.json();
    },
  });

  // 2. MUTACIÓN PARA POSTULAR (La forma segura de enviar datos)
  const mutation = useMutation({
    mutationFn: async (oppId) => {
      const res = await authFetch('http://localhost:5001/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: oppId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al postular');
      return data;
    },
    onSuccess: () => {
      alert("✅ ¡Postulación enviada con éxito! Revisa 'Mis Postulaciones'.");
      // Opcional: Recargar las postulaciones en segundo plano
      queryClient.invalidateQueries(['my-applications']);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const handleApply = (id) => {
    if (
      !window.confirm('¿Estás seguro de que quieres postularte a esta vacante?')
    )
      return;
    mutation.mutate(id);
  };

  // --- FILTRADO ---
  // El backend devuelve "pasantia" (sin tilde) o "vinculacion"
  const filterType = type === 'pasantia' ? 'pasantia' : 'vinculacion';
  const filteredOpps = opportunities.filter((op) => op.type === filterType);

  // --- TEXTOS ---
  const pageTitle =
    type === 'pasantia'
      ? 'Prácticas Pre-Profesionales'
      : 'Vinculación con la Sociedad';
  const themeColor = type === 'pasantia' ? 'text-blue-600' : 'text-rose-600';
  const badgeColor =
    type === 'pasantia'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-rose-100 text-rose-700';

  if (isLoading)
    return (
      <div className="p-20 text-center">
        <Loader className="animate-spin mx-auto text-blue-600" size={30} />{' '}
        <p className="mt-4 text-slate-500">Buscando ofertas...</p>
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Error: {error.message}
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className={`text-3xl font-black ${themeColor} mb-2 tracking-tight`}>
          {pageTitle}
        </h1>
        <p className="text-slate-500">
          Mostrando <strong>{filteredOpps.length}</strong> vacantes disponibles.
        </p>
      </div>

      <div className="grid gap-6">
        {filteredOpps.length === 0 ? (
          <div className="text-center p-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-lg">
              No hay ofertas de {type} disponibles por ahora.
            </p>
            <p className="text-slate-400 text-sm">Intenta revisar más tarde.</p>
          </div>
        ) : (
          filteredOpps.map((op) => (
            <div
              key={op.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md mb-3 inline-block tracking-wider ${badgeColor}`}
                  >
                    {op.type}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
                    {op.title}
                  </h2>
                  <p className="font-medium text-slate-500 flex items-center gap-1 mt-1">
                    <Building size={16} className="text-slate-400" />{' '}
                    {op.company}
                  </p>

                  <p className="mt-4 text-sm text-slate-600 line-clamp-2">
                    {op.description}
                  </p>

                  <div className="mt-4 flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {op.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Cierra: {op.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Botón Postular */}
                  <button
                    onClick={() => handleApply(op.id)}
                    disabled={mutation.isPending}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                  >
                    {mutation.isPending ? 'Enviando...' : 'Postular Ahora'}{' '}
                    <ArrowRight size={16} />
                  </button>
                  <span className="text-xs text-slate-400 font-medium">
                    {op.vacancies} vacantes
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Opportunities;
