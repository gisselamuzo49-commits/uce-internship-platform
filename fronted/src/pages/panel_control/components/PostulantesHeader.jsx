import React from 'react';
import { UserCheck, Calendar, FileSpreadsheet } from 'lucide-react';

const PostulantesHeader = ({
    selectedDate,
    setSelectedDate,
    downloadExcel,
    hasData,
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-800 uppercase flex items-center gap-3">
                    <UserCheck className="text-blue-600" size={32} />
                    Reporte de Aprobados (Excel)
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Estudiantes aprobados en la fecha seleccionada.
                </p>
            </div>

            {/* Date picker and export button */}
            <div className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Calendar
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={20}
                    />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold"
                    />
                </div>
                <button
                    onClick={downloadExcel}
                    disabled={!hasData}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${hasData
                        ? 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-1'
                        : 'bg-slate-300 cursor-not-allowed'
                        }`}
                >
                    <FileSpreadsheet size={20} />
                    Exportar Excel
                </button>
            </div>
        </div>
    );
};

export default PostulantesHeader;
