import React, { useState, useEffect } from 'react';
import { UserPlus, X, Mail, User } from 'lucide-react';

const TutorAssignmentModal = ({ isOpen, onConfirm, onCancel, isLoading }) => {
    const [tutorName, setTutorName] = useState('');
    const [tutorEmail, setTutorEmail] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTutorName('');
            setTutorEmail('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(tutorName, tutorEmail);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[10000] flex justify-center items-center p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <UserPlus size={24} className="text-blue-600" />
                        Asignar Tutor
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <User size={12} /> Nombre del Docente Tutor
                        </label>
                        <input
                            required
                            autoFocus
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={tutorName}
                            onChange={(e) => setTutorName(e.target.value)}
                            placeholder="Nombre completo"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Mail size={12} /> Correo del Docente Tutor
                        </label>
                        <input
                            required
                            type="email"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={tutorEmail}
                            onChange={(e) => setTutorEmail(e.target.value)}
                            placeholder="ejemplo@uce.edu.ec"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Asignando...' : 'Asignar Tutor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TutorAssignmentModal;
