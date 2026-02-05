import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex gap-6 border-b border-slate-200 mb-6">
            <button
                onClick={() => setActiveTab('applications')}
                className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'applications'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500'
                    }`}
            >
                Postulaciones de Empleo
            </button>
            <button
                onClick={() => setActiveTab('tutor')}
                className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'tutor'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500'
                    }`}
            >
                Formalización (Tutores)
            </button>
        </div>
    );
};

export default TabNavigation;
