import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config/api';

export const useStudentDashboard = () => {
    const { user, authFetch } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Component state
    const [showCVModal, setShowCVModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [visualNotification, setVisualNotification] = useState({
        message: null,
        type: null,
    });
    const [appointmentData, setAppointmentData] = useState({
        appId: '',
        date: '',
        time: '',
    });
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    // Fetch student applications
    const { data: applications = [], isLoading: loadingApps } = useQuery({
        queryKey: ['applications', 'student'],
        queryFn: async () => {
            const res = await authFetch(`${API_URL}/api/student/my-applications`);
            if (!res.ok) throw new Error('Error fetching applications');
            return res.json();
        },
        staleTime: 1000 * 60,
    });

    // Fetch student appointments
    const { data: myAppointments = [], isLoading: loadingAppts } = useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const res = await authFetch(`${API_URL}/api/appointments`);
            if (!res.ok) return [];
            return res.json();
        },
    });

    // Fetch student profile for score calculation
    const { data: profileData } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            const res = await authFetch(`${API_URL}/api/profile/${user.id}`);
            return res.json();
        },
        enabled: !!user,
    });

    // Calculate statistics
    const approvedApps = applications.filter((app) => app.status === 'Aprobado');
    const notifications = applications.filter(
        (app) => app.status !== 'Pendiente'
    );

    let studentScore = 20;
    if (applications.length > 0) studentScore += 40;
    if (profileData?.certifications?.length > 0) studentScore += 40;
    const isLoading = loadingApps || loadingAppts;

    // Handle CV submission
    const handleCVSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const file = document.getElementById('cv-upload').files[0];
        if (!file) {
            setVisualNotification({ message: 'Selecciona un PDF', type: 'error' });
            setUploading(false);
            return;
        }
        let token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API_URL}/api/tutor-requests`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (res.ok) {
                setVisualNotification({
                    message: '✅ Archivo Subido',
                    type: 'success',
                });
                setShowCVModal(false);
            } else {
                setVisualNotification({ message: '❌ Error', type: 'error' });
            }
        } catch {
            setVisualNotification({ message: '❌ Error conexión', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!appointmentData.appId) return;
        setScheduling(true);
        try {
            const res = await authFetch(`${API_URL}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    application_id: appointmentData.appId,
                    date: appointmentData.date,
                    time: appointmentData.time,
                }),
            });
            if (res.ok) {
                setShowCalendarModal(false);
                setVisualNotification({ message: '✅ Cita Agendada', type: 'success' });
                queryClient.invalidateQueries({ queryKey: ['appointments'] });
            }
        } catch (e) {
            setVisualNotification({ message: 'Error al agendar', type: 'error' });
        } finally {
            setScheduling(false);
        }
    };

    const closeNotification = () => setVisualNotification({ message: null, type: null });

    return {
        data: {
            user,
            applications,
            myAppointments,
            approvedApps,
            notifications,
            studentScore,
            appointmentData,
        },
        loading: {
            isLoading,
            uploading,
            scheduling,
        },
        modals: {
            showCVModal,
            setShowCVModal,
            showCalendarModal,
            setShowCalendarModal,
            showNotifDropdown,
            setShowNotifDropdown,
        },
        notification: {
            ...visualNotification,
            close: closeNotification,
        },
        actions: {
            setVisualNotification,
            setAppointmentData,
            handleCVSubmit,
            handleScheduleSubmit,
            navigate,
        }
    };
};
