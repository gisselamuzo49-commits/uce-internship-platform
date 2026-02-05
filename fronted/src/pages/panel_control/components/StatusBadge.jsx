import React from 'react';

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase() || '';

    if (s === 'aprobado') {
        return (
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">
                Aprobado
            </span>
        );
    }

    if (s === 'rechazado') {
        return (
            <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-rose-200">
                Rechazado
            </span>
        );
    }

    return (
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-200">
            Pendiente
        </span>
    );
};

export default StatusBadge;
