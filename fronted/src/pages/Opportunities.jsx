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
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

const Opportunities = () => {
  const { user, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [myApplications, setMyApplications] = useState([]);

  // --- ESTADO PARA NOTIFICACIONES (VERDE/ROJO) ---
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: '', type: '' }),
      4000
    );
  };

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

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar oferta?'))
      showNotification(
        'Funcionalidad de borrado pendiente de conectar.',
        'error'
      );
  };

  const handleApply = async (oppId) => {
    if (!user) return showNotification('Inicia sesión primero', 'error');

    if (window.confirm('¿Deseas postularte a esta oferta?')) {
      try {
        const res = await authFetch('http://localhost:5001/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity_id: oppId }),
        });

        if (res.ok) {
          showNotification('✅ ¡Postulación enviada correctamente!', 'success');
          fetchData();
        } else {
          // MANEJO DE ERRORES CON COLORES
          const err = await res.json();
          if (err.error === 'Caducado')
            showNotification(
              '⛔ ERROR: La fecha límite de esta oferta ya pasó.',
              'error'
            );
          else if (err.error === 'Lleno')
            showNotification(
              '⛔ ERROR: Ya no quedan vacantes disponibles.',
              'error'
            );
          else
            showNotification('Error al postular. Intenta de nuevo.', 'error');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredOpps = opportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (dateString) =>
    dateString && new Date(dateString) < new Date();

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen relative">
      {/* --- NOTIFICACIÓN FLOTANTE --- */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 font-bold text-white ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
          {notification.message}
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 hover:bg-white/20 p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase">
            {isAdmin ? 'Gestión de Vacantes' : 'Bolsa de Empleos'}
          </h1>
          <p className="text-slate-500 font-medium">Revisa vacantes y cupos.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-3.5 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : (
        <>
          {isAdmin ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-slate-500 text-xs uppercase">
                      Oportunidad
                    </th>
                    <th className="p-5 text-slate-500 text-xs uppercase">
                      Fecha Límite
                    </th>
                    <th className="p-5 text-slate-500 text-xs uppercase text-center">
                      Ocupación (Cupos)
                    </th>
                    <th className="p-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOpps.map((opp) => {
                    const expired = isExpired(opp.deadline);
                    const isFull = opp.applicants_count >= opp.vacancies;
                    return (
                      <tr key={opp.id} className="hover:bg-slate-50 transition">
                        <td className="p-5">
                          <p className="font-bold text-slate-800">
                            {opp.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {opp.company} • {opp.location}
                          </p>
                        </td>
                        <td className="p-5">
                          <div
                            className={`flex items-center gap-2 text-sm font-bold ${expired ? 'text-rose-500' : 'text-emerald-600'}`}
                          >
                            <Calendar size={16} /> {opp.deadline || 'N/A'}
                            {expired && (
                              <span className="text-[10px] bg-rose-100 px-2 rounded-full">
                                CADUCADO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-bold ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                          >
                            <Users size={16} /> {opp.applicants_count} /{' '}
                            {opp.vacancies}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleDelete(opp.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpps.map((opp) => {
                const applied = myApplications.includes(opp.title);
                const expired = isExpired(opp.deadline);
                const isFull = opp.applicants_count >= opp.vacancies;

                return (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full group relative overflow-hidden"
                  >
                    {(expired || isFull) && (
                      <div className="absolute inset-0 bg-slate-50/50 z-10 pointer-events-none" />
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
                    <h3 className="text-xl font-bold text-slate-800 mb-1 relative z-20">
                      {opp.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 relative z-20">
                      {opp.company}
                    </p>

                    <div className="mb-4 relative z-20">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Cupos:</span>
                        <span
                          className={isFull ? 'text-rose-500' : 'text-blue-600'}
                        >
                          {opp.applicants_count} / {opp.vacancies}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
                    <div className="mt-auto relative z-20">
                      <button
                        onClick={() => handleApply(opp.id)}
                        disabled={applied || expired || isFull}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${applied ? 'bg-emerald-50 text-emerald-600' : expired || isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg'}`}
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
