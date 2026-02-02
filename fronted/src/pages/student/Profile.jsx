import React from 'react';
import { useProfile } from './useProfile';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

// --- COMPONENTES COMUNES ---
import ProfileHeader from './components/ProfileHeader';
import EditProfileModal from './components/EditProfileModal';

// --- COMPONENTES DE ESTUDIANTE ---
import ExperienceList from './components/ExperienceList';
import EducationList from './components/EducationList';
import FormalizationList from './components/FormalizationList';

// --- COMPONENTES DE ADMINISTRADOR ---
import ManagementStats from './components/ManagementStats'; // ✅ Solo importamos esto

const UserProfile = () => {
  const { data, loading, modals, notification, forms, actions } = useProfile();

  // Extraemos adminStats (que viene de la BD)
  const { user, isStudent, requests, adminStats } = data;

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 relative space-y-8 min-h-screen">
      {/* NOTIFICACIONES */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 font-bold text-white ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
          {notification.message}
          <button
            onClick={notification.close}
            className="ml-4 hover:bg-white/20 p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <ProfileHeader
        user={user}
        isStudent={isStudent}
        onEdit={() => modals.setIsEditing(true)}
      />

      {/* VISTA ESTUDIANTE */}
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

      {/* VISTA ADMINISTRADOR (Limpia, sin bitácora, solo métricas) */}
      {!isStudent && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
          {/* Usamos max-w-2xl para que el panel se vea centrado y elegante */}
          <div className="w-full max-w-2xl">
            <ManagementStats stats={adminStats} />
          </div>
        </div>
      )}

      {/* MODAL */}
      {modals.isEditing && (
        <EditProfileModal
          form={forms.profile}
          onSubmit={actions.onUpdateProfile}
          loading={loading.updating}
          onClose={() => modals.setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
