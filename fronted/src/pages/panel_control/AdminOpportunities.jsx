import React from 'react';

// Custom hook for all business logic
import { useAdminOpportunities } from './useAdminOpportunities';

// UI Components
import OpportunitiesHeader from './components/OpportunitiesHeader';
import OpportunitiesTable from './components/OpportunitiesTable';
import OpportunityFormModal from './components/OpportunityFormModal';
import ConfirmModal from './components/ConfirmModal';

const AdminOpportunities = () => {
  const { data, loading, filters, modal, form, actions } = useAdminOpportunities();

  const { filteredOpps } = data;
  const { isLoading, isPending } = loading;
  const { searchTerm, setSearchTerm, filterType, setFilterType } = filters;
  const { isModalOpen, isEditing, closeModal } = modal;
  const { formData, handleFormChange, handleSubmit } = form;
  const { handleOpenCreate, handleOpenEdit, handleDelete } = actions;

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Page header with filters and create button */}
      <OpportunitiesHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        onCreateClick={handleOpenCreate}
      />

      {/* Opportunities table */}
      <OpportunitiesTable
        filteredOpps={filteredOpps}
        isLoading={isLoading}
        handleOpenEdit={handleOpenEdit}
        handleDelete={handleDelete}
      />

      {/* Create/Edit opportunity modal */}
      <OpportunityFormModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        formData={formData}
        handleFormChange={handleFormChange}
        handleSubmit={handleSubmit}
        closeModal={closeModal}
        isPending={isPending}
      />

      <ConfirmModal
        isOpen={modal.isConfirmModalOpen}
        title="Eliminar Oferta"
        message="¿Estás seguro de que quieres eliminar esta oferta? Esta acción no se puede deshacer."
        onConfirm={actions.confirmDelete}
        onCancel={() => modal.setIsConfirmModalOpen(false)}
        isLoading={loading.isPending}
      />
    </div>
  );
};

export default AdminOpportunities;
