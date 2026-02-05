import React from 'react';
import { Loader, AlertTriangle } from 'lucide-react';

// Custom hook for all business logic
import { useAdminRequests } from './useAdminRequests';

// UI Components
import RequestsHeader from './components/RequestsHeader';
import TabNavigation from './components/TabNavigation';
import ApplicationsTable from './components/ApplicationsTable';
import TutorRequestsTable from './components/TutorRequestsTable';
import StudentProfileModal from './components/StudentProfileModal';

const AdminRequests = () => {
  const { data, loading, error, state, actions } = useAdminRequests();

  const { filteredApps, filteredTutor, fullProfile, basicStudentInfo } = data;
  const { isLoading, loadingProfile } = loading;
  const { isError } = error;
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    viewingStudentId,
  } = state;
  const {
    handleStatusChange,
    handleOpenProfile,
    handleCloseProfile,
    handleFileChange,
    generateStudentCV,
  } = actions;

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">
          Cargando datos del sistema...
        </p>
      </div>
    );
  }

  // Display error state
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 p-4 rounded-full w-fit mx-auto mb-4 text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Error de Conexión
          </h3>
          <p className="text-slate-500 mb-6 text-sm">
            No se pudieron cargar los datos.
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition w-full"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      {/* Page header with search */}
      <RequestsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Tab navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Applications tab */}
      {activeTab === 'applications' && (
        <ApplicationsTable
          filteredApps={filteredApps}
          filterType={filterType}
          setFilterType={setFilterType}
          handleStatusChange={handleStatusChange}
          handleOpenProfile={handleOpenProfile}
        />
      )}

      {/* Tutor formalization tab */}
      {activeTab === 'tutor' && (
        <TutorRequestsTable
          filteredTutor={filteredTutor}
          handleStatusChange={handleStatusChange}
          handleOpenProfile={handleOpenProfile}
          handleFileChange={handleFileChange}
        />
      )}

      {/* Student profile modal */}
      <StudentProfileModal
        viewingStudentId={viewingStudentId}
        basicStudentInfo={basicStudentInfo}
        fullProfile={fullProfile}
        loadingProfile={loadingProfile}
        handleCloseProfile={handleCloseProfile}
        generateStudentCV={generateStudentCV}
      />
    </div>
  );
};

export default AdminRequests;
