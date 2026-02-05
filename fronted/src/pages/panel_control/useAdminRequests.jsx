import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { API_URL } from '../../config/api';

export const useAdminRequests = () => {
    const { authFetch } = useAuth();
    const queryClient = useQueryClient();

    // Component state
    const [activeTab, setActiveTab] = useState('applications');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Modal state for viewing student profile
    const [viewingStudentId, setViewingStudentId] = useState(null);
    const [basicStudentInfo, setBasicStudentInfo] = useState(null);

    // Fetch applications
    const {
        data: applications,
        isLoading: loadingApps,
        isError: isErrorApps,
    } = useQuery({
        queryKey: ['admin-applications'],
        queryFn: async () => {
            const res = await authFetch(`${API_URL}/api/admin/applications`);
            if (!res.ok) throw new Error('Error al cargar postulaciones');
            return res.json();
        },
        retry: 1,
    });

    // Fetch tutor requests
    const {
        data: tutorRequests,
        isLoading: loadingTutor,
        isError: isErrorTutor,
    } = useQuery({
        queryKey: ['admin-tutor-requests'],
        queryFn: async () => {
            const res = await authFetch(`${API_URL}/api/admin/tutor-requests`);
            if (!res.ok) throw new Error('Error al cargar solicitudes de tutor');
            return res.json();
        },
        retry: 1,
    });

    // Fetch full student profile
    const { data: fullProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ['student-profile', viewingStudentId],
        queryFn: async () => {
            if (!viewingStudentId) return null;
            const res = await authFetch(
                `${API_URL}/api/admin/students/${viewingStudentId}`
            );
            if (!res.ok) throw new Error('No se pudo cargar el perfil detallado');
            return res.json();
        },
        enabled: !!viewingStudentId,
    });

    // Upload memo/support document mutation
    const uploadMemoMutation = useMutation({
        mutationFn: async ({ id, file }) => {
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('token');

            const res = await fetch(
                `${API_URL}/api/admin/tutor-requests/${id}/upload-memo`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            if (!res.ok) throw new Error('Error al subir el memo');
            return res.json();
        },
        onSuccess: () => {
            alert('✅ Memo subido correctamente');
            queryClient.invalidateQueries(['admin-tutor-requests']);
        },
        onError: () => {
            alert('❌ Error al subir el archivo');
        },
    });

    const handleFileChange = (e, reqId) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Solo se permiten archivos PDF');
                return;
            }
            uploadMemoMutation.mutate({ id: reqId, file });
        }
    };

    // Generate student CV as PDF
    const generateStudentCV = (profileData, fallbackData) => {
        const student = {
            name: fallbackData?.name || profileData?.name || 'Estudiante',
            email: fallbackData?.email || profileData?.email || 'Sin correo',
            experiences: profileData?.experiences || [],
            certifications: profileData?.certifications || [],
        };

        const doc = new jsPDF();
        const margin = 20;
        let y = 20;

        doc.setFontSize(22);
        doc.setTextColor(30, 58, 138);
        doc.text(student.name, margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(student.email, margin, y);
        y += 15;

        doc.setDrawColor(200);
        doc.line(margin, y, 190, y);
        y += 10;

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Experiencia Laboral', margin, y);
        y += 10;

        doc.setFontSize(11);
        if (student.experiences && student.experiences.length > 0) {
            student.experiences.forEach((exp) => {
                doc.setFont('helvetica', 'bold');
                doc.text(exp.role || 'Cargo', margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `${exp.company} | ${exp.start_date} - ${exp.end_date || 'Presente'}`,
                    margin,
                    y
                );
                y += 7;
                if (exp.description) {
                    const splitDesc = doc.splitTextToSize(exp.description, 170);
                    doc.text(splitDesc, margin, y);
                    y += splitDesc.length * 5 + 5;
                } else {
                    y += 5;
                }
            });
        } else {
            doc.setFont('helvetica', 'italic');
            doc.text('No hay experiencia registrada.', margin, y);
            y += 10;
        }

        y += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Formación y Cursos', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        if (student.certifications && student.certifications.length > 0) {
            student.certifications.forEach((cert) => {
                doc.text(
                    `• ${cert.title} - ${cert.institution} (${cert.year})`,
                    margin,
                    y
                );
                y += 7;
            });
        } else {
            doc.setFont('helvetica', 'italic');
            doc.text('No hay educación registrada.', margin, y);
        }

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generado por Plataforma de Gestión', margin, 280);
        doc.save(`CV_${student.name.replace(/\s+/g, '_')}.pdf`);
    };

    // Update application or request status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, type, status, tutor_name, tutor_email }) => {
            const body = { status };
            if (tutor_name) body.tutor_name = tutor_name;
            if (tutor_email) body.tutor_email = tutor_email;

            const res = await authFetch(`${API_URL}/api/admin/${type}/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Error al actualizar estado');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-applications']);
            queryClient.invalidateQueries(['admin-tutor-requests']);
        },
    });

    const handleStatusChange = (id, type, status) => {
        if (type === 'tutor-requests' && status === 'Aprobado') {
            const tutorName = prompt('✅ Ingresa el NOMBRE del Docente Tutor:');
            if (!tutorName?.trim()) return;
            const tutorEmail = prompt('📧 Ingresa el CORREO del Docente Tutor:');
            updateStatusMutation.mutate({
                id,
                type,
                status,
                tutor_name: tutorName,
                tutor_email: tutorEmail,
            });
        } else {
            if (
                window.confirm(`¿Seguro que deseas cambiar el estado a: ${status}?`)
            ) {
                updateStatusMutation.mutate({ id, type, status });
            }
        }
    };

    const handleOpenProfile = (item) => {
        const id = item.student_id || item.user_id;
        if (!id) return alert('Error: No se encontró el ID del estudiante.');
        setViewingStudentId(id);
        setBasicStudentInfo({
            name: item.student_name,
            email: item.student_email,
        });
    };

    const handleCloseProfile = () => {
        setViewingStudentId(null);
        setBasicStudentInfo(null);
    };

    // Safe arrays
    const safeApps = Array.isArray(applications) ? applications : [];
    const safeTutors = Array.isArray(tutorRequests) ? tutorRequests : [];

    // Filtered data
    const filteredApps = safeApps.filter((app) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            (app.student_name || '').toLowerCase().includes(search) ||
            (app.opportunity_title || '').toLowerCase().includes(search);
        const matchesType = filterType === 'all' || app.type === filterType;
        return matchesSearch && matchesType;
    });

    const filteredTutor = safeTutors.filter((req) =>
        (req.student_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isLoading = loadingApps || loadingTutor;
    const isError = isErrorApps || isErrorTutor;

    return {
        data: {
            filteredApps,
            filteredTutor,
            fullProfile,
            basicStudentInfo,
        },
        loading: {
            isLoading,
            loadingProfile,
        },
        error: {
            isError,
        },
        state: {
            activeTab,
            setActiveTab,
            searchTerm,
            setSearchTerm,
            filterType,
            setFilterType,
            viewingStudentId,
        },
        actions: {
            handleStatusChange,
            handleOpenProfile,
            handleCloseProfile,
            handleFileChange,
            generateStudentCV,
        },
    };
};
