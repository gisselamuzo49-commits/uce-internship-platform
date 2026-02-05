import React from 'react';

// Custom hook for all business logic
import { useAdminDashboard } from './useAdminDashboard';

// UI Components
import AdminHeader from './components/AdminHeader';
import AdminStatsGrid from './components/AdminStatsGrid';
import QuickActionsCard from './components/QuickActionsCard';
import TutorWorkloadChart from './components/TutorWorkloadChart';
import AppointmentsSection from './components/AppointmentsSection';
import ActivityTrendChart from './components/ActivityTrendChart';
import NewOpportunityModal from './components/NewOpportunityModal';

const AdminDashboard = () => {
  const { data, form, modal } = useAdminDashboard();

  const { user, stats, appointments } = data;
  const { showCreateModal, setShowCreateModal } = modal;

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header with welcome message */}
      <AdminHeader userName={user?.name} />

      {/* Dashboard statistics cards */}
      <AdminStatsGrid stats={stats} />

      {/* Main dashboard grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick actions and tutor workload charts */}
        <div className="lg:col-span-1 space-y-8">
          <QuickActionsCard onCreateClick={() => setShowCreateModal(true)} />
          <TutorWorkloadChart data={stats?.tutor_workload} />
        </div>

        {/* Appointments and activity trend charts */}
        <div className="lg:col-span-2 space-y-8">
          <AppointmentsSection appointments={appointments} />
          <ActivityTrendChart data={stats?.activity_trend} />
        </div>
      </div>

      {/* Create new opportunity modal */}
      {showCreateModal && (
        <NewOpportunityModal
          onClose={() => setShowCreateModal(false)}
          form={form}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
