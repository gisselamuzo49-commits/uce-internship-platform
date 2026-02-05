import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config/api';

// Get correct local date
const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().split('T')[0];
};

export const usePostulantes = () => {
    const { authFetch } = useAuth();

    const [selectedDate, setSelectedDate] = useState(getLocalDate());
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch daily report from backend
    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await authFetch(
                `${API_URL}/api/admin/daily-report?date=${selectedDate}`
            );

            if (res.ok) {
                const data = await res.json();
                setReportData(data);
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

    // Download report as Excel file
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

    return {
        data: {
            reportData,
        },
        state: {
            selectedDate,
            setSelectedDate,
            loading,
        },
        actions: {
            downloadExcel,
        },
    };
};
