import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

const OpportunitiesHeader = ({
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    onCreateClick,
}) => {
    return (
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
                        value={searchTerm}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* BOTÓN CREAR */}
                <button
                    onClick={onCreateClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 md:w-auto w-full font-bold px-4"
                >
                    <Plus size={20} />
                    <span>Nueva Oferta</span>
                </button>
            </div>
        </div>
    );
};

export default OpportunitiesHeader;
