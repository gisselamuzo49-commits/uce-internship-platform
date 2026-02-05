import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Search,
  Plus,
  Filter,
  Save,
  X,
} from 'lucide-react';

// Centralized API URL import
import { API_URL } from '../../config/api';

const AdminOpportunities = () => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for opportunity
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    company: '',
    description: '',
    location: '',
    deadline: '',
    vacancies: 1,
    type: 'pasantia',
  });

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
      alert('✅ Oferta creada exitosamente');
    },
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
      alert('✅ Oferta actualizada');
    },
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
      alert('🗑️ Oferta eliminada');
    },
  });

  // Open modal to create new opportunity
  const handleOpenCreate = () => {
    setFormData({
      id: null,
      title: '',
      company: '',
      description: '',
      location: '',
      deadline: '',
      vacancies: 1,
      type: 'pasantia',
    });
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
    if (window.confirm('¿Seguro que quieres eliminar esta oferta?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter opportunities by search term and type
  const filteredOpps = opportunities.filter((op) => {
    const matchesSearch =
      op.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || op.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Page header with filters and create button */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Gestión de Ofertas
          </h1>
          <p className="text-slate-500">Crea, edita o elimina las vacantes.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          {/* Filtros */}
          <div className="relative min-w-[160px]">
            <Filter
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Todo Tipo</option>
              <option value="pasantia">Solo Pasantías</option>
              <option value="vinculacion">Solo Vinculación</option>
            </select>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar vacante..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* BOTÓN CREAR */}
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 md:w-auto w-full font-bold px-4"
          >
            <Plus size={20} />
            <span>Nueva Oferta</span>
          </button>
        </div>
      </div>

      {/* Opportunities table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center animate-pulse text-slate-500">
            Cargando ofertas...
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="flex justify-center mb-4">
              <Briefcase size={40} className="text-slate-200" />
            </div>
            No hay ofertas creadas. ¡Crea la primera!
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Cargo / Título</th>
                <th className="p-4">Empresa</th>
                <th className="p-4">Ubicación & Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOpps.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <Briefcase size={18} />
                      </div>
                      <span className="font-bold text-slate-800">
                        {op.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">
                    {op.company}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin size={12} /> {op.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} /> Fin: {op.deadline}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${op.type === 'pasantia' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                    >
                      {op.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(op)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(op.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit opportunity modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-black text-slate-800">
                {isEditing ? 'Editar Oferta' : 'Nueva Oferta'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Título
                    </label>
                    <input
                      required
                      className="input-std"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ej: Desarrollador Jr."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Empresa
                    </label>
                    <input
                      required
                      className="input-std"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="Ej: Tech Corp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Tipo
                    </label>
                    <select
                      className="input-std"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="pasantia">Pasantía</option>
                      <option value="vinculacion">Vinculación</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Ubicación
                    </label>
                    <input
                      required
                      className="input-std"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Ej: Remoto / Quito"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Descripción
                  </label>
                  <textarea
                    required
                    className="input-std h-32 resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detalles del puesto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Fecha Límite
                    </label>
                    <input
                      required
                      type="date"
                      className="input-std"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Vacantes
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="input-std"
                      value={formData.vacancies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vacancies: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2"
                  >
                    <Save size={18} />{' '}
                    {isEditing ? 'Guardar Cambios' : 'Crear Oferta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Input field styles */}
      <style>{`
        .input-std {
            width: 100%;
            padding: 0.75rem;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            outline: none;
            font-size: 0.875rem;
            transition: all 0.2s;
        }
        .input-std:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AdminOpportunities;
