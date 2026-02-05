import React from 'react';
import { useProfile } from './useProfile';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import ConfirmModal from '../panel_control/components/ConfirmModal';

// Common components
import ProfileHeader from './components/ProfileHeader';
import EditProfileModal from './components/EditProfileModal';

// Student components
import ExperienceList from './components/ExperienceList';
import EducationList from './components/EducationList';
import FormalizationList from './components/FormalizationList';

// Admin components
import ManagementStats from './components/ManagementStats';

const UserProfile = () => {
  const { data, loading, modals, confirmData, forms, actions } = useProfile();

  // Extract relevant data
  const { user, isStudent, requests, adminStats } = data;

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 relative space-y-8 min-h-screen">
      {/* Profile header */}
      <ProfileHeader
        user={user}
        isStudent={isStudent}
        onEdit={() => modals.setIsEditing(true)}
      />

      {/* Student profile sections */}
      {isStudent && (
        <>
          <ExperienceList
            form={forms.exp}
            onSubmit={actions.onAddExperience}
            loading={loading.addingExp}
            experiences={user.experiences}
            onDelete={actions.handleDeleteExp}
          />
          <EducationList
            form={forms.cert}
            onSubmit={actions.onAddCert}
            loading={loading.addingCert}
            certifications={user.certifications}
            onDelete={actions.handleDeleteCert}
          />
          <FormalizationList
            form={forms.tutor}
            onSubmit={actions.onUploadTutor}
            loading={loading.uploading}
            requests={requests}
            onDownload={actions.handleDownloadMemo}
          />
        </>
      )}

      {/* Admin dashboard */}
      {!isStudent && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
          <div className="w-full max-w-2xl">
            <ManagementStats stats={adminStats} />
          </div>
        </div>
      )}

      {/* Edit profile modal */}
      {modals.isEditing && (
        <EditProfileModal
          form={forms.profile}
          onSubmit={actions.onUpdateProfile}
          loading={loading.updating}
          onClose={() => modals.setIsEditing(false)}
        />
      )}

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={modals.isConfirmModalOpen}
        title={`Eliminar ${confirmData?.type === 'experience' ? 'Experiencia' : 'Certificación'}`}
        message={`¿Estás seguro de que deseas eliminar esta ${confirmData?.type === 'experience' ? 'experiencia laboral' : 'certificación'}? Esta acción no se puede deshacer.`}
        onConfirm={actions.confirmDelete}
        onCancel={() => modals.setIsConfirmModalOpen(false)}
        isLoading={false}
      />
    </div>
  );
};

export default UserProfile;
