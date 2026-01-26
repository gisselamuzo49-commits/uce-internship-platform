import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react';

// --- IMPORTAMOS LOS COMPONENTES ---
import Notification from '../components/Notification'; // El que tú me pasaste
import OpportunityCard from '../components/OpportunityCard'; // El nuevo (Estudiante)
import AdminOppTable from '../components/AdminOppTable'; // El nuevo (Admin)

const Opportunities = () => {
  const { user, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';

  // --- ESTADOS ---
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [myApplications, setMyApplications] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [applyId, setApplyId] = useState(null);

  // Estado para Notificaciones (Ahora usamos el componente Notification)
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  // --- HELPER DE NOTIFICACIONES ---
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
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

  // --- LÓGICA DE BORRADO (ADMIN) ---
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

  // --- LÓGICA DE POSTULACIÓN (ESTUDIANTE) ---
  const handleApplyClick = (oppId) => {
    if (!user)
      return showNotification('Debes iniciar sesión para postularte.', 'error');
    setApplyId(oppId);
  };

  const confirmPostulation = async () => {
    if (!applyId) return;
    try {
      const res = await authFetch('http://localhost:5001/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: applyId }),
      });

      if (res.ok) {
        showNotification('✅ ¡Postulación enviada con éxito!', 'success');
        fetchData();
      } else {
        const err = await res.json();
        if (err.error === 'Caducado')
          showNotification('⛔ ERROR: La fecha límite ya pasó.', 'error');
        else if (err.error === 'Lleno')
          showNotification('⛔ ERROR: Vacantes agotadas.', 'error');
        else
          showNotification('❌ Error al postular. Intenta de nuevo.', 'error');
      }
    } catch (error) {
      showNotification('❌ Error de conexión con el servidor.', 'error');
    } finally {
      setApplyId(null);
    }
  };

  // Filtros
  const filteredOpps = opportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen relative">
      {/* NOTIFICACIÓN REUTILIZABLE */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: null })}
      />

      {/* --- MODAL 1: ELIMINAR (ADMIN) --- */}
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
                Se borrarán también las postulaciones asociadas.
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

      {/* --- MODAL 2: CONFIRMAR (ESTUDIANTE) --- */}
      {applyId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-50 p-6 flex flex-col items-center text-center border-b border-indigo-100">
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mb-4 shadow-sm">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-indigo-900">
                Confirmar Postulación
              </h3>
              <p className="text-indigo-800 text-sm mt-2">
                ¿Estás seguro de que deseas enviar tu perfil a esta empresa?
              </p>
            </div>
            <div className="p-4 bg-white flex gap-3 justify-center">
              <button
                onClick={() => setApplyId(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPostulation}
                className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center gap-2"
              >
                <CheckCircle size={18} /> Sí, Postularme
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

      {/* --- CONTENIDO PRINCIPAL (LIMPIO) --- */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Cargando ofertas...
        </div>
      ) : (
        <>
          {isAdmin ? (
            // VISTA ADMIN: USAMOS EL NUEVO COMPONENTE
            <AdminOppTable
              opportunities={filteredOpps}
              onDelete={setDeleteId}
            />
          ) : (
            // VISTA ESTUDIANTE: USAMOS EL NUEVO COMPONENTE
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpps.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  isApplied={myApplications.includes(opp.title)}
                  onApply={handleApplyClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Opportunities;
