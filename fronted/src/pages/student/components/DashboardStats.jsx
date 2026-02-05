import React from 'react';
import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import { StatCard, StatSkeleton } from '../../panel_control/components/DashboardUI';

const DashboardStats = ({ isLoading, applications, myAppointments, approvedApps }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
                <>
                    {' '}
                    <StatSkeleton /> <StatSkeleton /> <StatSkeleton />{' '}
                </>
            ) : (
                <>
                    <StatCard
                        icon={Briefcase}
                        title="Postulaciones"
                        value={applications.length}
                        colorBg="bg-blue-50"
                        colorText="text-blue-600"
                    />
                    <StatCard
                        icon={Clock}
                        title="Entrevistas"
                        value={myAppointments.length}
                        colorBg="bg-purple-50"
                        colorText="text-purple-600"
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Aprobadas"
                        value={approvedApps.length}
                        colorBg="bg-orange-50"
                        colorText="text-orange-600"
                    />
                </>
            )}
        </div>
    );
};

export default DashboardStats;
