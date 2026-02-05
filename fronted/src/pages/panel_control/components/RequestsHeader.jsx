import React from 'react';
import { Search } from 'lucide-react';

const RequestsHeader = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Solicitudes</h1>
                <p className="text-slate-500">Gestión de postulantes y documentos.</p>
            </div>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
};

export default RequestsHeader;
