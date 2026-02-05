import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config/api';

const initialFormState = {
    id: null,
    title: '',
    company: '',
    description: '',
    location: '',
    deadline: '',
    vacancies: 1,
    type: 'pasantia',
};

export const useAdminOpportunities = () => {
    const { authFetch } = useAuth();
    const queryClient = useQueryClient();

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Form state for opportunity
    const [formData, setFormData] = useState(initialFormState);

    // Fetch all opportunities
    const {
        data: opportunities = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['admin-opportunities'],
        queryFn: async () => {
            const res = await authFetch(`${API_URL}/api/opportunities`);
            if (!res.ok) throw new Error('Error cargando ofertas');
            return res.json();
        },
    });

    // Create new opportunity mutation
    const createMutation = useMutation({
        mutationFn: async (newOpp) => {
            const res = await authFetch(`${API_URL}/api/opportunities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOpp),
            });
            if (!res.ok) throw new Error('Error al crear');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-opportunities']);
            closeModal();
            toast.success('Oferta creada exitosamente');
        },
        onError: (err) => {
            toast.error('Error al crear: ' + err.message);
        }
    });

    // Update opportunity mutation
    const updateMutation = useMutation({
        mutationFn: async (opp) => {
            const res = await authFetch(`${API_URL}/api/opportunities/${opp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(opp),
            });
            if (!res.ok) throw new Error('Error al actualizar');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-opportunities']);
            closeModal();
            toast.success('Oferta actualizada');
        },
        onError: (err) => {
            toast.error('Error al actualizar: ' + err.message);
        }
    });

    // Delete opportunity mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await authFetch(`${API_URL}/api/opportunities/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Error al borrar');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-opportunities']);
            setIsConfirmModalOpen(false);
            setDeleteId(null);
            toast.success('Oferta eliminada');
        },
        onError: (err) => {
            toast.error('Error al borrar: ' + err.message);
        }
    });

    // Open modal to create new opportunity
    const handleOpenCreate = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // Open modal to edit opportunity
    const handleOpenEdit = (opp) => {
        setFormData({
            id: opp.id,
            title: opp.title,
            company: opp.company,
            description: opp.description,
            location: opp.location,
            deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
            vacancies: opp.vacancies,
            type: opp.type,
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Filter opportunities by search term and type
    const filteredOpps = opportunities.filter((op) => {
        const matchesSearch =
            op.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || op.type === filterType;
        return matchesSearch && matchesType;
    });

    const isPending = createMutation.isPending || updateMutation.isPending;

    return {
        data: {
            filteredOpps,
        },
        loading: {
            isLoading,
            isPending,
        },
        error: {
            isError,
        },
        filters: {
            searchTerm,
            setSearchTerm,
            filterType,
            setFilterType,
        },
        modal: {
            isModalOpen,
            isEditing,
            closeModal,
            isConfirmModalOpen,
            setIsConfirmModalOpen,
        },
        form: {
            formData,
            handleFormChange,
            handleSubmit,
        },
        actions: {
            handleOpenCreate,
            handleOpenEdit,
            handleDelete,
            confirmDelete,
        },
    };
};
