import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Calendar,
  Search,
  UserCheck,
  Building,
  FileText,
  AlertCircle,
} from 'lucide-react';

const Postulantes = () => {
  const { authFetch } = useAuth();

  // --- CORRECCIÓN 1: OBTENER FECHA LOCAL CORRECTA ---
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. CARGAR DATOS DEL BACKEND ---
  const fetchReport = async () => {
    setLoading(true);
    try {
      // Asegúrate de que tu backend (puerto 5001) esté corriendo y la ruta sea correcta
      const res = await authFetch(
        `http://localhost:5001/api/admin/daily-report?date=${selectedDate}`
      );

      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        // Console log para depurar si llegan datos
        console.log('Datos recibidos para la fecha', selectedDate, ':', data);
      } else {
        console.error('Error en respuesta del servidor:', res.status);
      }
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // --- 2. FUNCIÓN DESCARGAR EXCEL ---
  const downloadExcel = () => {
    if (reportData.length === 0) return;

    const dataForExcel = reportData.map((item) => ({
      'Fecha Aprobación': item.fecha_aprobacion,
      Estudiante: item.estudiante,
      Correo: item.email,
      Empresa: item.empresa,
      Cargo: item.cargo,
      '¿Documentos Subidos?': item.documentacion_subida,
      'Estado Tutoría': item.estado_tutor,
      'Tutor Asignado': item.nombre_tutor,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Aprobados');
    XLSX.writeFile(workbook, `Reporte_Postulantes_${selectedDate}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase flex items-center gap-3">
            <UserCheck className="text-blue-600" size={32} />
            Reporte de Aprobados
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Estudiantes aprobados en la fecha seleccionada.
          </p>
        </div>

        {/* CONTROLES */}
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
            disabled={reportData.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${
              reportData.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-1'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet size={20} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* TABLA DE VISUALIZACIÓN */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Buscando datos del {selectedDate}...
          </div>
        ) : reportData.length === 0 ? (
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Postulantes;
