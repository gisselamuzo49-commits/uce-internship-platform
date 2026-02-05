import React from 'react';
import { ApplicationCard } from '../../panel_control/components/DashboardUI';

const RecentActivity = ({ applications, navigate }) => {
    return (
        <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
                Actividad Reciente
            </h2>
            <div className="space-y-4">
                {applications.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-400 font-medium">Sin actividad.</p>
                    </div>
                ) : (
                    applications
                        .slice(0, 3)
                        .map((item) => (
                            <ApplicationCard
                                key={item.id}
                                title={item.opportunity_title}
                                subtitle="Tu postulación"
                                status={item.status}
                                date={item.date}
                                onClick={() => navigate('/mis-postulaciones')}
                            />
                        ))
                )}
            </div>
        </section>
    );
};

export default RecentActivity;
