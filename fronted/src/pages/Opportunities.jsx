import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  MapPin,
  Calendar,
  Search,
  Building,
  Users,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Ban,
  X,
  AlertTriangle,
} from 'lucide-react';

const Opportunities = () => {
  const { user, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';

  // --- ESTADOS ---
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [myApplications, setMyApplications] = useState([]);

  // Estado para el Modal de Borrado
  const [deleteId, setDeleteId] = useState(null);

  // Estado para Notificaciones (Toasts)
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '', // 'success' (Verde) o 'error' (Rojo)
  });

  // --- HELPER DE NOTIFICACIONES ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: '', type: '' }),
      4000
    );
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/opportunities');
      if (res.ok) setOpportunities((await res.json()).reverse());

      if (user && !isAdmin) {
        const resApps = await authFetch(
          'http://localhost:5001/api/applications'
        );
        if (resApps.ok)
          setMyApplications(
            (await resApps.json()).map((a) => a.opportunity_title)
          );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE BORRADO ---
  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch(
        `http://localhost:5001/api/opportunities/${deleteId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        showNotification('✅ Vacante eliminada correctamente', 'success');
        fetchData();
      } else {
        showNotification('❌ Error al eliminar la vacante', 'error');
      }
    } catch (e) {
      showNotification('Error de conexión', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  // --- LÓGICA DE POSTULACIÓN (AQUÍ ESTÁ LA MAGIA DE COLORES) ---
  const handleApply = async (oppId) => {
    // 1. Si no hay usuario, error rojo
    if (!user)
      return showNotification('Debes iniciar sesión para postularte.', 'error');

    if (window.confirm('¿Deseas postularte a esta oferta?')) {
      try {
        const res = await authFetch('http://localhost:5001/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity_id: oppId }),
        });

        if (res.ok) {
          // 2. ÉXITO -> TIPO 'success' (VERDE)
          showNotification('✅ ¡Postulación enviada con éxito!', 'success');
          fetchData(); // Recargar para actualizar la barra de cupos
        } else {
          // 3. ERROR -> TIPO 'error' (ROJO)
          const err = await res.json();

          if (err.error === 'Caducado') {
            showNotification('⛔ ERROR: La fecha límite ya pasó.', 'error');
          } else if (err.error === 'Lleno') {
            showNotification('⛔ ERROR: Vacantes agotadas.', 'error');
          } else {
            showNotification(
              '❌ Error al postular. Intenta de nuevo.',
              'error'
            );
          }
        }
      } catch (error) {
        console.error(error);
        showNotification('❌ Error de conexión con el servidor.', 'error');
      }
    }
  };

  // Filtros
  const filteredOpps = opportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (dateString) =>
    dateString && new Date(dateString) < new Date();

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen relative">
      {/* --- NOTIFICACIÓN FLOTANTE (VERDE vs ROJO) --- */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 font-bold text-white 
          ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} // <--- AQUÍ CAMBIA EL COLOR
        >
          {notification.type === 'success' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 hover:bg-white/20 p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* --- MODAL DE ELIMINAR (AMARILLO) --- */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-100 p-6 flex flex-col items-center text-center border-b border-amber-200">
              <div className="bg-amber-200 p-3 rounded-full text-amber-700 mb-4 shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-amber-900">
                ¿Eliminar Vacante?
              </h3>
              <p className="text-amber-800 text-sm mt-2">
                Estás a punto de eliminar una oferta laboral. <br />
                <strong>Advertencia:</strong> Esto borrará también las
                postulaciones asociadas.
              </p>
            </div>
            <div className="p-4 bg-white flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200 transition flex items-center gap-2"
              >
                <Trash2 size={18} /> Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase">
            {isAdmin ? 'Gestión de Vacantes' : 'Bolsa de Empleos'}
          </h1>
          <p className="text-slate-500 font-medium">
            Revisa vacantes y cupos disponibles.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-3.5 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar cargo o empresa..."
            className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Cargando ofertas...
        </div>
      ) : (
        <>
          {/* VISTA DE ADMINISTRADOR (TABLA) */}
          {isAdmin ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      Oportunidad
                    </th>
                    <th className="p-5 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      Fecha Límite
                    </th>
                    <th className="p-5 text-slate-500 text-xs uppercase font-bold tracking-wider text-center">
                      Ocupación (Cupos)
                    </th>
                    <th className="p-5 text-slate-500 text-xs uppercase font-bold tracking-wider text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOpps.map((opp) => {
                    const expired = isExpired(opp.deadline);
                    const isFull = opp.applicants_count >= opp.vacancies;
                    return (
                      <tr
                        key={opp.id}
                        className="hover:bg-slate-50 transition group"
                      >
                        <td className="p-5">
                          <p className="font-bold text-slate-800 text-lg">
                            {opp.title}
                          </p>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Building size={14} /> {opp.company} •{' '}
                            <MapPin size={14} /> {opp.location}
                          </div>
                        </td>
                        <td className="p-5">
                          <div
                            className={`flex items-center gap-2 text-sm font-bold ${expired ? 'text-rose-500' : 'text-emerald-600'}`}
                          >
                            <Calendar size={16} />{' '}
                            {opp.deadline || 'Indefinido'}
                            {expired && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase">
                                Caducado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-lg ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                          >
                            <Users size={20} /> {opp.applicants_count} /{' '}
                            {opp.vacancies}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleDelete(opp.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Eliminar Oferta"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredOpps.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                  No se encontraron ofertas.
                </div>
              )}
            </div>
          ) : (
            /* VISTA DE ESTUDIANTE (TARJETAS) */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpps.map((opp) => {
                const applied = myApplications.includes(opp.title);
                const expired = isExpired(opp.deadline);
                const isFull = opp.applicants_count >= opp.vacancies;

                return (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full group relative overflow-hidden hover:-translate-y-1 duration-300"
                  >
                    {/* Capa de bloqueo visual si está expirado o lleno */}
                    {(expired || isFull) && !applied && (
                      <div className="absolute inset-0 bg-slate-50/60 z-10 pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-4 relative z-20">
                      <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                        <Briefcase size={24} />
                      </div>
                      {applied ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle size={12} /> Enviada
                        </span>
                      ) : expired ? (
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle size={12} /> Cerrada
                        </span>
                      ) : isFull ? (
                        <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Ban size={12} /> Lleno
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                          Activa
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-1 relative z-20 group-hover:text-blue-600 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 relative z-20 font-medium">
                      {opp.company}
                    </p>

                    {/* BARRA DE PROGRESO DE VACANTES */}
                    <div className="mb-4 relative z-20 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Ocupación:</span>
                        <span
                          className={isFull ? 'text-rose-500' : 'text-blue-600'}
                        >
                          {opp.applicants_count} / {opp.vacancies} Cupos
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-blue-500'}`}
                          style={{
                            width: `${Math.min((opp.applicants_count / opp.vacancies) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow relative z-20">
                      {opp.description}
                    </p>

                    <div className="mt-auto relative z-20 border-t border-slate-100 pt-4 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {opp.location}
                        </span>
                        <span className={expired ? 'text-rose-400' : ''}>
                          {opp.deadline || 'Sin fecha'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleApply(opp.id)}
                        disabled={applied || expired || isFull}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${applied ? 'bg-emerald-50 text-emerald-600 cursor-default' : expired || isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200'}`}
                      >
                        {applied ? (
                          'Ya te has postulado'
                        ) : expired ? (
                          'Oferta Caducada'
                        ) : isFull ? (
                          'Vacantes Agotadas'
                        ) : (
                          <>
                            Postularme Ahora <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Opportunities;
