import React from 'react';
import { ModalOverlay } from '../../panel_control/components/DashboardUI';

const CVUploadModal = ({ onClose, onSubmit, uploading }) => {
    return (
        <ModalOverlay title="Subir Documento" onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-6">
                <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
                >
                    {uploading ? 'Subiendo...' : 'Enviar'}
                </button>
            </form>
        </ModalOverlay>
    );
};

export default CVUploadModal;
