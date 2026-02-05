import React from 'react';
import { Search, Calendar, Edit } from 'lucide-react';
import { QuickActionCard } from '../../panel_control/components/DashboardUI';

const QuickActions = ({ approvedApps, navigate, setShowCalendarModal }) => {
    return (
        <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
                Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickActionCard
                    icon={Search}
                    title="Buscar Empleo"
                    primary
                    onClick={() => navigate('/oportunidades')}
                />
                <QuickActionCard
                    icon={Calendar}
                    title="Agendar Entrevista"
                    subtitle={
                        approvedApps.length > 0
                            ? '¡Tienes aprobaciones!'
                            : 'Requiere aprobación'
                    }
                    onClick={() => setShowCalendarModal(true)}
                    disabled={approvedApps.length === 0}
                />
                <QuickActionCard
                    icon={Edit}
                    title="Editar Perfil"
                    onClick={() => navigate('/perfil')}
                />
            </div>
        </section>
    );
};

export default QuickActions;
