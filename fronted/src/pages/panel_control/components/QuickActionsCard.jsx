import React from 'react';
import { Plus } from 'lucide-react';

const QuickActionsCard = ({ onCreateClick }) => {
    return (
        <div className="h-fit bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
                Gestión Rápida
            </h2>
            <button
                onClick={onCreateClick}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
                <Plus size={20} /> Publicar Nueva Oferta
            </button>
            <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg text-sm font-bold">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>{' '}
                    Sistema Operativo
                </div>
            </div>
        </div>
    );
};

export default QuickActionsCard;
