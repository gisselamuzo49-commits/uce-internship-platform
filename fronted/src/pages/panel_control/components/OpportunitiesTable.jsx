import React from 'react';
import { Briefcase, Edit, Trash2, MapPin, Calendar } from 'lucide-react';

const OpportunitiesTable = ({
    filteredOpps,
    isLoading,
    handleOpenEdit,
    handleDelete,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-10 text-center animate-pulse text-slate-500">
                    Cargando ofertas...
                </div>
            </div>
        );
    }

    if (filteredOpps.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-16 text-center text-slate-400">
                    <div className="flex justify-center mb-4">
                        <Briefcase size={40} className="text-slate-200" />
                    </div>
                    No hay ofertas creadas. ¡Crea la primera!
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                        <th className="p-4">Cargo / Título</th>
                        <th className="p-4">Empresa</th>
                        <th className="p-4">Ubicación & Fecha</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredOpps.map((op) => (
                        <tr key={op.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                        <Briefcase size={18} />
                                    </div>
                                    <span className="font-bold text-slate-800">
                                        {op.title}
                                    </span>
                                </div>
                            </td>
                            <td className="p-4 font-medium text-slate-600">
                                {op.company}
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1 mb-1">
                                    <MapPin size={12} /> {op.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} /> Fin: {op.deadline}
                                </div>
                            </td>
                            <td className="p-4">
                                <span
                                    className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${op.type === 'pasantia'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-purple-50 text-purple-600'
                                        }`}
                                >
                                    {op.type}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleOpenEdit(op)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(op.id)}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OpportunitiesTable;
