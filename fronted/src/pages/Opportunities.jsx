import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Briefcase,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';

const Opportunities = () => {
  const { authFetch, user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar oportunidades desde el Backend (Puerto 5001)
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        // Agregamos datos visuales extra para que se vea como tu diseño
        // (ya que la base de datos aún no tiene salario ni etiquetas)
        const enhancedData = data.map((op, index) => ({
          ...op,
          // Colores rotativos para los logos (Azul, Morado, Verde, Rojo)
          colorTheme: ['blue', 'purple', 'green', 'red'][index % 4],
          salary: index % 2 === 0 ? '$800 - $1200' : '$400 - $600',
          tags:
            index % 2 === 0
              ? ['Empleo', 'Remoto', 'Tiempo Completo']
              : ['Pasantía', 'Híbrido', 'Medio Tiempo'],
          closingDate: '15 Feb 2026',
        }));
        setOpportunities(enhancedData);
      }
    } catch (error) {
      console.error('Error cargando ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (op) => {
    if (!confirm(`¿Deseas postularte a: ${op.title}?`)) return;

    try {
      const res = await authFetch('http://localhost:5001/api/applications', {
        method: 'POST',
        body: JSON.stringify({ opportunity_title: op.title }),
      });
      if (res.ok) alert('¡Postulación enviada con éxito!');
      else alert('Error al postular.');
    } catch (error) {
      alert('Error de conexión.');
    }
  };

  // Función para obtener clases de color según el tema
  const getThemeClasses = (color) => {
    const themes = {
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-600',
        light: 'bg-purple-50',
      },
      green: {
        bg: 'bg-emerald-600',
        text: 'text-emerald-600',
        light: 'bg-emerald-50',
      },
      red: { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-50' },
    };
    return themes[color] || themes.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      {/* HEADER CON BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Oportunidades Laborales
          </h1>
          <p className="text-slate-500 font-medium">
            Encuentra el trabajo ideal para tu carrera profesional.
          </p>
        </div>

        {/* Barra de Búsqueda Estilizada */}
        <div className="flex items-center bg-white p-2 rounded-full shadow-sm border border-slate-200 w-full md:w-auto">
          <Search className="text-slate-400 ml-3" size={20} />
          <input
            type="text"
            placeholder="Buscar por cargo o empresa..."
            className="bg-transparent border-none outline-none px-4 py-2 text-sm w-64 text-slate-700 font-medium placeholder-slate-400"
          />
          <button className="bg-[#1e293b] text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* GRID DE TARJETAS (DISEÑO SOLICITADO) */}
      {loading ? (
        <p className="text-center text-slate-400 font-bold">
          Cargando vacantes...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((op) => {
            const theme = getThemeClasses(op.colorTheme);
            const initial = op.company.charAt(0).toUpperCase();

            return (
              <div
                key={op.id}
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all relative group"
              >
                {/* HEADER DE LA TARJETA */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    {/* Logo con Inicial y Color */}
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md ${theme.bg}`}
                    >
                      {initial}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                        {op.title}
                      </h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {op.company}
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-blue-500 transition-colors">
                    <Bookmark size={24} />
                  </button>
                </div>

                {/* ETIQUETAS (TAGS) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {op.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        i === 0
                          ? 'bg-blue-50 text-blue-600'
                          : i === 1
                            ? 'bg-green-50 text-green-600'
                            : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* DESCRIPCIÓN CORTA */}
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {op.description ||
                    'Únete a nuestro equipo y desarrolla tu potencial en un ambiente innovador y dinámico. Buscamos talento joven de la UCE.'}
                </p>

                {/* INFO LOCATION & SALARY */}
                <div className="flex items-center gap-6 mb-6 text-sm font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    {op.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={16} className="text-slate-400" />
                    {op.salary}
                  </div>
                </div>

                {/* FOOTER: FECHA Y BOTÓN */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Clock size={14} />
                    Cierra: {op.closingDate}
                  </div>

                  {user.role === 'student' ? (
                    <button
                      onClick={() => handleApply(op)}
                      className="bg-[#1e293b] hover:bg-blue-600 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      Postular <ChevronRight size={16} />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-300 uppercase bg-slate-100 px-3 py-1 rounded-lg">
                      Vista de Admin
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
