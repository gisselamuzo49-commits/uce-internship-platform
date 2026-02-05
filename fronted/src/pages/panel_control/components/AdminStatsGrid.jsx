import React from 'react';
import { Users, FileText, TrendingUp, Briefcase } from 'lucide-react';
import { StatCard } from './DashboardUI';

const AdminStatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Estudiantes"
                value={stats?.students || 0}
                icon={Users}
                colorBg="bg-blue-50"
                colorText="text-blue-600"
            />
            <StatCard
                title="Solicitudes"
                value={stats?.applications || 0}
                icon={FileText}
                colorBg="bg-purple-50"
                colorText="text-purple-600"
            />
            <StatCard
                title="Pendientes"
                value={stats?.pending || 0}
                icon={TrendingUp}
                colorBg="bg-orange-50"
                colorText="text-orange-600"
            />
            <StatCard
                title="Ofertas Activas"
                value={stats?.opportunities || 0}
                icon={Briefcase}
                colorBg="bg-emerald-50"
                colorText="text-emerald-600"
            />
        </div>
    );
};

export default AdminStatsGrid;
