import React from 'react';
import { Server, Database, Users, Wifi } from 'lucide-react';

const SystemStatus = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Server className="text-blue-600" /> Estado del Servidor
      </h2>

      <div className="space-y-6">
        {/* Métrica 1: Base de Datos */}
        <div>
          <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-2">
              <Database size={16} /> Conexión BD
            </span>
            <span className="text-emerald-500">Estable</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full w-full animate-pulse"></div>
          </div>
        </div>

        {/* Métrica 2: Capacidad */}
        <div>
          <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-2">
              <Wifi size={16} /> Ancho de Banda
            </span>
            <span>45%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full w-[45%]"></div>
          </div>
        </div>

        {/* Métrica 3: Usuarios */}
        <div>
          <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-2">
              <Users size={16} /> Usuarios Activos
            </span>
            <span>3</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-indigo-500 h-2.5 rounded-full w-[15%]"></div>
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            El sistema SIIU está operando correctamente v1.0.2
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
