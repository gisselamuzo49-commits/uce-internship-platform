import React from 'react';
import {
    CheckCircle,
    XCircle,
    FileText,
    Download,
    Eye,
    UserPlus,
    Mail,
    Upload,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { API_URL } from '../../../config/api';

const TutorRequestsTable = ({
    filteredTutor,
    handleStatusChange,
    handleOpenProfile,
    handleFileChange,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                        <th className="p-4">Estudiante</th>
                        <th className="p-4">Solicitud</th>
                        <th className="p-4">Tutor Asignado</th>
                        <th className="p-4">Memo/Aval</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTutor.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400">
                                No hay solicitudes de tutoría.
                            </td>
                        </tr>
                    ) : (
                        filteredTutor.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50/50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800 text-sm">
                                        {req.student_name}
                                    </div>
                                    <button
                                        onClick={() => handleOpenProfile(req)}
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        <Eye size={12} /> Ver Perfil
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-start gap-2">
                                        <FileText size={18} className="text-slate-400 mt-0.5" />
                                        <div>
                                            <span className="block text-sm font-medium text-slate-700">
                                                {req.title}
                                            </span>
                                            <a
                                                href={`${API_URL}/api/uploads/${req.filename}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-bold"
                                            >
                                                <Download size={12} /> Ver PDF
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {req.assigned_tutor ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                                                <UserPlus size={14} />
                                                <span className="text-xs font-bold">
                                                    {req.assigned_tutor}
                                                </span>
                                            </div>
                                            {req.tutor_email && (
                                                <div className="flex items-center gap-1.5 text-slate-500 ml-1">
                                                    <Mail size={12} />
                                                    <span className="text-[11px] font-medium">
                                                        {req.tutor_email}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">
                                            --
                                        </span>
                                    )}
                                </td>

                                {/* Memo upload and view */}
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {req.memo_filename ? (
                                            <a
                                                href={`${API_URL}/api/uploads/${req.memo_filename}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100"
                                            >
                                                <CheckCircle size={12} /> Ver Memo
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">
                                                Pendiente
                                            </span>
                                        )}

                                        {/* Hidden file input for upload */}
                                        <label
                                            className="cursor-pointer p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                                            title="Subir Memo/Aval"
                                        >
                                            <Upload size={16} />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={(e) => handleFileChange(e, req.id)}
                                            />
                                        </label>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <StatusBadge status={req.status} />
                                </td>
                                <td className="p-4 text-right">
                                    {req.status === 'Pendiente' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        req.id,
                                                        'tutor-requests',
                                                        'Aprobado'
                                                    )
                                                }
                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        req.id,
                                                        'tutor-requests',
                                                        'Rechazado'
                                                    )
                                                }
                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
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
    );
};

export default TutorRequestsTable;
