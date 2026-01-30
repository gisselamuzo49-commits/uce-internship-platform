import React from 'react';
// 👇 Agregamos Trash2 aquí
import { Building, X, Trash2 } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const QuickActionCard = ({
  icon: Icon,
  title,
  primary = false,
  onClick,
  disabled = false,
  subtitle,
}) => (
  <button
    onClick={disabled ? null : onClick}
    disabled={disabled}
    className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all w-full text-left active:scale-95 relative overflow-hidden ${
      disabled
        ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed opacity-70'
        : primary
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 cursor-pointer'
          : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50 hover:shadow-sm cursor-pointer'
    }`}
  >
    <Icon
      size={20}
      className={
        disabled
          ? 'text-slate-300'
          : primary
            ? 'text-blue-100'
            : 'text-blue-600'
      }
    />
    <div className="flex flex-col">
      <span>{title}</span>
      {subtitle && (
        <span className="text-[10px] font-normal opacity-80">{subtitle}</span>
      )}
    </div>
  </button>
);

export const StatCard = ({ icon: Icon, title, value, colorBg, colorText }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 h-full hover:shadow-md transition-all">
    <div className={`p-4 rounded-xl ${colorBg} ${colorText}`}>
      <Icon size={28} strokeWidth={2} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

// 👇 AQUÍ ESTÁ LA ACTUALIZACIÓN CON EL BOTÓN DE BORRAR
export const ApplicationCard = ({
  title,
  subtitle,
  status,
  date,
  tags,
  onClick,
  onDelete, // Recibimos la función
}) => {
  // Mapa de colores flexible (por si el status no coincide exacto, usa el gris)
  const statusColors = {
    Pendiente: 'bg-yellow-100 text-yellow-700',
    Aprobado: 'bg-emerald-100 text-emerald-700',
    Rechazado: 'bg-rose-100 text-rose-700',
  };

  // Determinar color base si no está en el mapa
  const badgeClass = statusColors[status] || 'bg-slate-100 text-slate-700';

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Ícono de edificio (podemos cambiar color según tipo si quieres, por ahora azul como tu diseño) */}
        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Building size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
          {tags && tags.skills && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}
          >
            {status}
          </span>
          <p className="text-xs text-slate-400 mt-2">{date}</p>
        </div>

        {/* BOTÓN DE BORRAR: Solo aparece si le pasas la función onDelete */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evita que se abra el detalle al hacer click en borrar
              onDelete();
            }}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar Oferta"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export const ModalOverlay = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 h-full">
    <Skeleton className="h-16 w-16 rounded-xl" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);
