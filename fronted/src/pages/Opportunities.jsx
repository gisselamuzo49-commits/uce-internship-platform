import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // <--- Usamos tu nuevo AuthContext
import {
  Briefcase,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const Opportunities = () => {
  const { authFetch, user } = useAuth(); // Usamos authFetch que maneja el token automáticamente
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null); // Para mostrar spinner en el botón

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Cargar Ofertas
      const oppRes = await fetch('http://localhost:5001/api/opportunities');
      const oppData = await oppRes.json();

      // 2. Cargar mis postulaciones (para saber a cuáles ya apliqué)
      // Solo si el usuario está logueado
      let appsData = [];
      if (user) {
        try {
          const appRes = await authFetch(
            'http://localhost:5001/api/applications'
          );
          if (appRes.ok) {
            appsData = await appRes.json();
          }
        } catch (err) {
          console.log('Usuario no logueado o error cargando aplicaciones');
        }
      }

      setOpportunities(oppData);
      setMyApplications(appsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN DE POSTULACIÓN CORREGIDA ---
  const handleApply = async (opportunityId) => {
    if (!user) {
      alert('Debes iniciar sesión para postularte.');
      return;
    }

    setApplyingId(opportunityId);

    try {
      // Usamos authFetch: Ya incluye el token y el Content-Type correcto
      const res = await authFetch('http://localhost:5001/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          opportunity_id: opportunityId, // Asegúrate de enviar este nombre exacto
        }),
      });

      if (res.ok) {
        alert('✅ ¡Postulación enviada con éxito!');
        // Recargar datos para actualizar el botón
        fetchData();
      } else {
        const errorData = await res.json();
        alert(
          `❌ Error: ${errorData.error || 'No se pudo procesar la solicitud'}`
        );
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setApplyingId(null);
    }
  };

  // Función auxiliar para saber si ya apliqué a una oferta
  const hasApplied = (oppId) => {
    return myApplications.some(
      (app) =>
        app.opportunity_title ===
          opportunities.find((o) => o.id === oppId)?.title ||
        app.opportunity_id === oppId
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-black text-slate-800 mb-2">
        Oportunidades Disponibles
      </h1>
      <p className="text-slate-500 mb-8">
        Encuentra tu próxima pasantía profesional.
      </p>

      {loading ? (
        <div className="text-center py-10">Cargando ofertas...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => {
            const isApplied = hasApplied(opp.id);

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Briefcase className="text-blue-600" size={24} />
                    </div>
                    {isApplied && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Postulado
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {opp.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-500 text-sm">
                      <Building size={16} className="mr-2" /> {opp.company}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <MapPin size={16} className="mr-2" />{' '}
                      {opp.location || 'Quito'}
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                    {opp.description}
                  </p>
                </div>

                <button
                  onClick={() => handleApply(opp.id)}
                  disabled={isApplied || applyingId === opp.id}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2
                    ${
                      isApplied
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95'
                    }
                  `}
                >
                  {applyingId === opp.id ? (
                    <span>Procesando...</span>
                  ) : isApplied ? (
                    'Ya te has postulado'
                  ) : (
                    'Postularme Ahora'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
