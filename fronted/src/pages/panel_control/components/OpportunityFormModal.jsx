import React from 'react';
import { X, Save } from 'lucide-react';

const OpportunityFormModal = ({
    isOpen,
    isEditing,
    formData,
    handleFormChange,
    handleSubmit,
    closeModal,
    isPending,
}) => {
    if (!isOpen) return null;

    return (
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
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    value={formData.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    placeholder="Ej: Desarrollador Jr."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                    Empresa
                                </label>
                                <input
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    value={formData.company}
                                    onChange={(e) => handleFormChange('company', e.target.value)}
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
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    value={formData.type}
                                    onChange={(e) => handleFormChange('type', e.target.value)}
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
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    value={formData.location}
                                    onChange={(e) => handleFormChange('location', e.target.value)}
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
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition h-32 resize-none"
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
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
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    value={formData.deadline}
                                    onChange={(e) => handleFormChange('deadline', e.target.value)}
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
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    value={formData.vacancies}
                                    onChange={(e) =>
                                        handleFormChange('vacancies', parseInt(e.target.value))
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
                                disabled={isPending}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />{' '}
                                {isEditing ? 'Guardar Cambios' : 'Crear Oferta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OpportunityFormModal;
