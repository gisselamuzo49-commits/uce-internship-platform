import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config/api';

export const useAdminDashboard = () => {
    const { authFetch, user } = useAuth();
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state for new opportunity
    const [newOpp, setNewOpp] = useState({
        title: '',
        company: '',
        description: '',
        location: '',
        deadline: '',
        vacancies: 1,
        type: 'pasantia',
    });

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewOpp((prev) => ({ ...prev, [name]: value }));
    };

    // Fetch admin dashboard statistics
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => (await authFetch(`${API_URL}/api/admin/stats`)).json(),
    });

    const { data: appointments = [] } = useQuery({
        queryKey: ['admin-appointments'],
        queryFn: async () =>
            (await authFetch(`${API_URL}/api/admin/appointments`)).json(),
    });

    // Create new opportunity mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await authFetch(`${API_URL}/api/opportunities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Error al crear');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Oferta publicada correctamente');
            setShowCreateModal(false);
            setNewOpp({
                title: '',
                company: '',
                description: '',
                location: '',
                deadline: '',
                vacancies: 1,
                type: 'pasantia',
            });
            queryClient.invalidateQueries(['admin-stats']);
        },
        onError: (err) => {
            toast.error('Error al publicar: ' + err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(newOpp);
    };

    return {
        data: {
            user,
            stats,
            appointments,
        },
        form: {
            newOpp,
            handleChange,
            handleSubmit,
            isPending: createMutation.isPending,
        },
        modal: {
            showCreateModal,
            setShowCreateModal,
        },
    };
};
