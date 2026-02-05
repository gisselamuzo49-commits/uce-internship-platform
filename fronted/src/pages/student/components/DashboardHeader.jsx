import React from 'react';
import { Bell } from 'lucide-react';

const DashboardHeader = ({ user, notifications, showNotifDropdown, setShowNotifDropdown }) => {
    return (
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative z-40">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                    Hola, {user?.name}
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                    Panel de estudiante.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 relative"
                >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </button>
                {showNotifDropdown && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4">
                        <h4 className="font-bold mb-2">Actualizaciones</h4>
                        {notifications.length === 0 && (
                            <p className="text-xs text-gray-400">Sin novedades</p>
                        )}
                        {notifications.map((n) => (
                            <div key={n.id} className="text-sm py-2 border-b">
                                {n.opportunity_title}: {n.status}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
};

export default DashboardHeader;
