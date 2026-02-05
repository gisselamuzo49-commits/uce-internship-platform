import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[10000] flex justify-center items-center p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-50 p-3 rounded-full text-amber-500">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">{title}</h3>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Procesando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
