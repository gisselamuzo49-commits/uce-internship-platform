import React from 'react';
import { Building, MapPin, Calendar, Users, Trash2 } from 'lucide-react';

const AdminOppTable = ({ opportunities, onDelete }) => {
  const isExpired = (dateString) =>
    dateString && new Date(dateString) < new Date();

  return (
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
          {opportunities.map((opp) => {
            const expired = isExpired(opp.deadline);
            const isFull = opp.applicants_count >= opp.vacancies;
            return (
              <tr key={opp.id} className="hover:bg-slate-50 transition group">
                <td className="p-5">
                  <p className="font-bold text-slate-800 text-lg">
                    {opp.title}
                  </p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Building size={14} /> {opp.company} • <MapPin size={14} />{' '}
                    {opp.location}
                  </div>
                </td>
                <td className="p-5">
                  <div
                    className={`flex items-center gap-2 text-sm font-bold ${expired ? 'text-rose-500' : 'text-emerald-600'}`}
                  >
                    <Calendar size={16} /> {opp.deadline || 'Indefinido'}
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
                    <Users size={20} /> {opp.applicants_count} / {opp.vacancies}
                  </div>
                </td>
                <td className="p-5 text-right">
                  <button
                    onClick={() => onDelete(opp.id)}
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
      {opportunities.length === 0 && (
        <div className="p-10 text-center text-slate-400">
          No se encontraron ofertas.
        </div>
      )}
    </div>
  );
};

export default AdminOppTable;
