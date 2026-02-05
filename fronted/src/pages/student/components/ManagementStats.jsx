import React from 'react';
import { FileText, Clock, PieChart, CheckCircle } from 'lucide-react';

// Receive stats from parent component
const ManagementStats = ({ stats }) => {
  // Default values to prevent errors during loading
  const safeStats = stats || {
    total: 0,
    aprobadas: 0,
    pendientes: 0,
    avales: 0,
  };

  // Calculate percentage of documents vs approved applications
  const porcentajeAvales =
    safeStats.aprobadas > 0
      ? Math.round((safeStats.avales / safeStats.aprobadas) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <PieChart className="text-blue-600" /> Panel de Gestión (Tiempo Real)
      </h2>

      <div className="space-y-8">
        {/* Pending requests card */}
        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl text-orange-500 shadow-sm">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                Por Revisar
              </p>
              <p className="text-xs text-slate-500">Solicitudes nuevas</p>
            </div>
          </div>
          <span className="relative z-10 text-4xl font-black text-orange-500">
            {safeStats.pendientes}
          </span>

          {/* Background gradient decoration */}
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-100/50 to-transparent"></div>
        </div>

        {/* Documents progress bar */}
        <div>
          <div className="flex justify-between text-sm font-bold text-slate-700 mb-3">
            <span className="flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Avales Generados
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs">
              {safeStats.avales} / {safeStats.aprobadas} Aprobados
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ width: `${porcentajeAvales}%` }}
            >
              {porcentajeAvales > 10 && (
                <span className="text-[9px] text-white font-bold">
                  {porcentajeAvales}%
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">
            El {porcentajeAvales}% de los estudiantes aprobados ya tiene su memo
            PDF.
          </p>
        </div>

        {/* Summary of statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 transition">
            <span className="text-3xl font-black text-slate-800">
              {safeStats.total}
            </span>
            <span className="text-xs text-slate-400 uppercase font-bold mt-1">
              Total Solicitudes
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl hover:bg-emerald-50 transition group">
            <span className="text-3xl font-black text-emerald-500 group-hover:scale-110 transition">
              {safeStats.aprobadas}
            </span>
            <span className="text-xs text-emerald-600/70 uppercase font-bold mt-1 flex items-center gap-1">
              <CheckCircle size={10} /> Aprobadas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementStats;
