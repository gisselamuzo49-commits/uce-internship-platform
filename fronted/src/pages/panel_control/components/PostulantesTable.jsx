import React from 'react';
import { Search, Building, FileText, AlertCircle } from 'lucide-react';

const PostulantesTable = ({ reportData, loading, selectedDate }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-12 text-center text-slate-400 animate-pulse">
                    Buscando datos del {selectedDate}...
                </div>
            </div>
        );
    }

    if (reportData.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-16 text-center flex flex-col items-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
                        <Search size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">
                        Sin aprobaciones esta fecha
                    </h3>
                    <p className="text-slate-400 text-sm mt-2">
                        Si aprobaste estudiantes hoy, verifica la hora del sistema.
                        <br />
                        Intenta seleccionar fechas anteriores.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Estudiante
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Empresa / Cargo
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                                Documentación
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                                Tutor
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reportData.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">
                                        {row.estudiante}
                                    </div>
                                    <div className="text-xs text-slate-500">{row.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <Building size={14} className="text-blue-500" />{' '}
                                        {row.empresa}
                                    </div>
                                    <div className="text-xs text-slate-500 pl-6">
                                        {row.cargo}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    {row.documentacion_subida === 'SÍ' ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                            <FileText size={12} /> Subida
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                            <AlertCircle size={12} /> Pendiente
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="text-sm font-bold text-slate-700">
                                        {row.nombre_tutor}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                                        {row.estado_tutor}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostulantesTable;
