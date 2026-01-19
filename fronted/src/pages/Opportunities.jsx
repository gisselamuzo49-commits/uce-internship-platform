import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Building, Briefcase, Search, XCircle } from 'lucide-react';
import Notification from '../components/Notification';

const Opportunities = () => {
  const { authFetch, user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null); // Ahora guardaremos el ID aquí
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 LÓGICA CORREGIDA: Ahora usamos el ID de la oportunidad
  const handleApply = async (op) => {
    setApplying(op.id);
    try {
      const res = await authFetch('http://localhost:5001/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: op.id }), // <--- CAMBIO CLAVE
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          message: `¡Te has postulado exitosamente a: ${op.title}!`,
          type: 'success',
        });
      } else {
        setNotification({
          message: data.error || 'Hubo un error al postular.',
          type: 'error',
        });
      }
    } catch (error) {
      setNotification({
        message: 'Error de conexión con el servidor.',
        type: 'error',
      });
    } finally {
      setApplying(null);
    }
  };

  const filteredOpportunities = opportunities.filter((op) => {
    const term = searchTerm.toLowerCase();
    return (
      op.title.toLowerCase().includes(term) ||
      op.company.toLowerCase().includes(term) ||
      (op.location && op.location.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in relative">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: null })}
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Oportunidades Laborales
          </h1>
          <p className="text-slate-500 font-medium">
            Encuentra tu próxima pasantía o empleo.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cargo, empresa o ciudad..."
            className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-600 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-blue-600 font-bold animate-pulse">
          Cargando ofertas...
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold">
          <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
          <p>
            {searchTerm
              ? `No encontramos ofertas para "${searchTerm}"`
              : 'No hay ofertas disponibles.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((op) => (
            <div
              key={op.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building size={24} />
                  </div>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                    Pasantía
                  </span>
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-1">
                  {op.title}
                </h3>
                <p className="text-blue-600 font-bold text-sm mb-4">
                  {op.company}
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {op.description || 'Sin descripción.'}
                </p>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                  <MapPin size={14} /> {op.location || 'Quito, EC'}
                </div>
              </div>

              {user?.role === 'student' ? (
                <button
                  onClick={() => handleApply(op)} // <-- Pasamos el objeto completo
                  disabled={applying === op.id}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    applying === op.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95'
                  }`}
                >
                  {applying === op.id ? 'Postulando...' : 'Postularme Ahora'}
                </button>
              ) : (
                <div className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-center text-sm">
                  Vista Admin
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
