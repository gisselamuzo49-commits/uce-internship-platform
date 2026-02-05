import React from 'react';
import { useStudentDashboard } from './useStudentDashboard';
import Notification from '../../components/Notification';

// Dashboard components
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import ProfileLevel from './components/ProfileLevel';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import CVUploadModal from './components/CVUploadModal';
import ScheduleModal from './components/ScheduleModal';

const StudentDashboard = () => {
  const { data, loading, modals, notification, actions } = useStudentDashboard();

  const {
    user,
    applications,
    myAppointments,
    approvedApps,
    notifications,
    studentScore,
    appointmentData,
  } = data;

  const { isLoading, uploading, scheduling } = loading;

  const {
    showCVModal,
    setShowCVModal,
    showCalendarModal,
    setShowCalendarModal,
    showNotifDropdown,
    setShowNotifDropdown,
  } = modals;

  const {
    setAppointmentData,
    handleCVSubmit,
    handleScheduleSubmit,
    navigate,
  } = actions;

  return (
    <div className="max-w-7xl mx-auto p-8 relative min-h-screen">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={notification.close}
      />

      {/* Modals */}
      {showCVModal && (
        <CVUploadModal
          onClose={() => setShowCVModal(false)}
          onSubmit={handleCVSubmit}
          uploading={uploading}
        />
      )}
      {showCalendarModal && (
        <ScheduleModal
          onClose={() => setShowCalendarModal(false)}
          onSubmit={handleScheduleSubmit}
          scheduling={scheduling}
          approvedApps={approvedApps}
          appointmentData={appointmentData}
          setAppointmentData={setAppointmentData}
        />
      )}

      {/* Page header with user greeting */}
      <DashboardHeader
        user={user}
        notifications={notifications}
        showNotifDropdown={showNotifDropdown}
        setShowNotifDropdown={setShowNotifDropdown}
      />

      {/* Statistics cards */}
      <DashboardStats
        isLoading={isLoading}
        applications={applications}
        myAppointments={myAppointments}
        approvedApps={approvedApps}
      />

      {/* Profile completion score */}
      <ProfileLevel studentScore={studentScore} />

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <QuickActions
            approvedApps={approvedApps}
            navigate={navigate}
            setShowCalendarModal={setShowCalendarModal}
          />
          <RecentActivity
            applications={applications}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
