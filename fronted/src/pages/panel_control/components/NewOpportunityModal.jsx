import React from 'react';
import {
    Briefcase,
    Users,
    MapPin,
    Calendar,
    Building,
    AlignLeft,
    PlusCircle,
} from 'lucide-react';
import { ModalOverlay } from './DashboardUI';

const NewOpportunityModal = ({ onClose, form }) => {
    const { newOpp, handleChange, handleSubmit, isPending } = form;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-slate-900 p-6 text-white flex items-center gap-3 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                <PlusCircle size={24} />
                <h1 className="text-2xl font-black">Publicar Nueva Vacante</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Tipo de Oferta
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="pasantia"
                                checked={newOpp.type === 'pasantia'}
                                onChange={handleChange}
                                className="peer sr-only"
                            />
                            <div className="p-3 rounded-xl border border-slate-200 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700 flex items-center gap-2 hover:bg-slate-50 transition-all">
                                <Briefcase size={18} />
                                <span className="font-bold text-sm">Prácticas</span>
                            </div>
                        </label>
                        <label className="cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="vinculacion"
                                checked={newOpp.type === 'vinculacion'}
                                onChange={handleChange}
                                className="peer sr-only"
                            />
                            <div className="p-3 rounded-xl border border-slate-200 peer-checked:bg-teal-50 peer-checked:border-teal-500 peer-checked:text-teal-700 flex items-center gap-2 hover:bg-slate-50 transition-all">
                                <Users size={18} />
                                <span className="font-bold text-sm">Vinculación</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Título
                        </label>
                        <div className="relative">
                            <Briefcase
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                type="text"
                                name="title"
                                value={newOpp.title}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Empresa
                        </label>
                        <div className="relative">
                            <Building
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                type="text"
                                name="company"
                                value={newOpp.company}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Ubicación
                        </label>
                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                type="text"
                                name="location"
                                value={newOpp.location}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Fecha Límite
                        </label>
                        <div className="relative">
                            <Calendar
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                type="date"
                                name="deadline"
                                value={newOpp.deadline}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Vacantes
                        </label>
                        <div className="relative">
                            <Users
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <input
                                type="number"
                                name="vacancies"
                                value={newOpp.vacancies}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Descripción
                    </label>
                    <div className="relative">
                        <AlignLeft
                            className="absolute left-3 top-3.5 text-slate-400"
                            size={18}
                        />
                        <textarea
                            rows="5"
                            name="description"
                            value={newOpp.description}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {isPending ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
};

export default NewOpportunityModal;
