import React from 'react';
import { CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ApplicationsTable = ({
    filteredApps,
    filterType,
    setFilterType,
    handleStatusChange,
    handleOpenProfile,
}) => {
    return (
        <>
            <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg w-fit border border-slate-200">
                <Filter size={16} className="text-slate-500" />
                <select
                    className="bg-white border border-slate-200 text-sm rounded-md p-1.5 outline-none cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">Todas</option>
                    <option value="pasantia">Pasantías</option>
                    <option value="vinculacion">Vinculación</option>
                </select>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Estudiante</th>
                            <th className="p-4">Vacante</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-400">
                                    No hay postulaciones.
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map((app) => (
                                <tr
                                    key={app.id}
                                    className="hover:bg-slate-50/50 transition"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {(app.student_name || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">
                                                    {app.student_name}
                                                </p>
                                                <button
                                                    onClick={() => handleOpenProfile(app)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-bold mt-1"
                                                >
                                                    <Eye size={14} /> Ver Perfil
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-700 text-sm">
                                        {app.opportunity_title}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${app.type === 'pasantia'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-purple-50 text-purple-600'
                                                }`}
                                        >
                                            {app.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={app.status} />
                                    </td>
                                    <td className="p-4 text-right">
                                        {app.status === 'Pendiente' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            app.id,
                                                            'applications',
                                                            'Aprobado'
                                                        )
                                                    }
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                                                    title="Aprobar"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            app.id,
                                                            'applications',
                                                            'Rechazado'
                                                        )
                                                    }
                                                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                                                    title="Rechazar"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ApplicationsTable;
