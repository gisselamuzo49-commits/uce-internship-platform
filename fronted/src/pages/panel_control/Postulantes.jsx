import React from 'react';

// Custom hook for all business logic
import { usePostulantes } from './usePostulantes';

// UI Components
import PostulantesHeader from './components/PostulantesHeader';
import PostulantesTable from './components/PostulantesTable';

const Postulantes = () => {
  const { data, state, actions } = usePostulantes();

  const { reportData } = data;
  const { selectedDate, setSelectedDate, loading } = state;
  const { downloadExcel } = actions;

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      {/* Page header with title and controls */}
      <PostulantesHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        downloadExcel={downloadExcel}
        hasData={reportData.length > 0}
      />

      {/* Report data table */}
      <PostulantesTable
        reportData={reportData}
        loading={loading}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Postulantes;
