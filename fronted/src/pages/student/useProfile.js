import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

// Centralized API URL import
import { API_URL } from '../../config/api';

export const useProfile = () => {
  const { user, authFetch, refreshUser } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  // Component state
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Datos Estudiante
  const [requests, setRequests] = useState([]);

  // Datos Administrador
  const [adminStats, setAdminStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    avales: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [addingExp, setAddingExp] = useState(false);

  // Modern Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const forms = {
    profile: useForm(),
    exp: useForm(),
    cert: useForm(),
    tutor: useForm(),
  };


  // Fetch tutor requests for student
  const fetchRequests = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/tutor-requests`);
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [authFetch]);

  // Fetch admin statistics
  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error('Error cargando stats:', e);
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) forms.profile.reset({ name: user.name });
    if (isStudent) fetchRequests();
    if (isAdmin) fetchAdminStats();
  }, [user, isStudent, isAdmin, fetchRequests, fetchAdminStats, forms.profile]);

  // Download memo/document file
  const handleDownloadMemo = async (filename) => {
    if (!filename) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/uploads/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al descargar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error al descargar');
    }
  };

  // Add new work experience
  const onAddExperience = async (data) => {
    setAddingExp(true);
    try {
      const res = await authFetch(`${API_URL}/api/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshUser();
        toast.success('Experiencia agregada');
        forms.exp.reset();
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setAddingExp(false);
    }
  };

  // Add new certification/course
  const onAddCert = async (data) => {
    setAddingCert(true);
    try {
      const res = await authFetch(`${API_URL}/api/certifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshUser();
        toast.success('Curso agregado');
        forms.cert.reset();
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setAddingCert(false);
    }
  };

  // Update user profile information
  const onUpdateProfile = async (data) => {
    setUpdating(true);
    try {
      const payload = { name: data.name };
      if (data.password) payload.password = data.password;
      const res = await authFetch(`${API_URL}/api/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await refreshUser();
        toast.success('Perfil actualizado');
        setIsEditing(false);
        forms.profile.reset({ name: data.name, password: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  // Upload tutor request document
  const onUploadTutor = async (data) => {
    const file = data.file[0];
    if (!file) return showNotification('Falta el archivo', 'error');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.docTitle);
    try {
      let token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/tutor-requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success('Solicitud enviada');
        forms.tutor.reset();
        fetchRequests();
      }
    } catch (e) {
      toast.error('Error conexión');
    } finally {
      setUploading(false);
    }
  };

  // Delete work experience entry
  const handleDeleteExp = (id) => {
    setConfirmData({ id, type: 'experience' });
    setIsConfirmModalOpen(true);
  };

  // Delete certification/course entry
  const handleDeleteCert = (id) => {
    setConfirmData({ id, type: 'certifications' });
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmData) return;
    const { id, type } = confirmData;
    try {
      const res = await authFetch(`${API_URL}/api/${type}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshUser();
        toast.success('Eliminado correctamente');
        setIsConfirmModalOpen(false);
        setConfirmData(null);
      }
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };


  return {
    data: { user, isStudent, requests, adminStats },
    loading: { updating, uploading, addingCert, addingExp },
    modals: { isEditing, setIsEditing, isConfirmModalOpen, setIsConfirmModalOpen },
    confirmData,
    forms,
    actions: {
      onAddExperience,
      onAddCert,
      onUpdateProfile,
      onUploadTutor,
      handleDeleteExp,
      handleDeleteCert,
      confirmDelete,
      handleDownloadMemo,
    },
  };
};
