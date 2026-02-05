import React from 'react';
import {
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle,
  Ban,
  ArrowRight,
} from 'lucide-react';

const OpportunityCard = ({ opp, isApplied, onApply }) => {
  // Compute opportunity status (expired, full, or available)
  const isExpired = opp.deadline && new Date(opp.deadline) < new Date();
  const isFull = opp.applicants_count >= opp.vacancies;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full group relative overflow-hidden hover:-translate-y-1 duration-300">
      {(isExpired || isFull) && !isApplied && (
        <div className="absolute inset-0 bg-slate-50/60 z-10 pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-4 relative z-20">
        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
          <Briefcase size={24} />
        </div>
        {isApplied ? (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} /> Enviada
          </span>
        ) : isExpired ? (
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

      <div className="mb-4 relative z-20 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Ocupación:</span>
          <span className={isFull ? 'text-rose-500' : 'text-blue-600'}>
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
          <span className={isExpired ? 'text-rose-400' : ''}>
            {opp.deadline || 'Sin fecha'}
          </span>
        </div>

        <button
          onClick={() => onApply(opp.id)}
          disabled={isApplied || isExpired || isFull}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            isApplied
              ? 'bg-emerald-50 text-emerald-600 cursor-default'
              : isExpired || isFull
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200'
          }`}
        >
          {isApplied ? (
            'Ya te has postulado'
          ) : isExpired ? (
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
};

export default OpportunityCard;
