import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useForm } from 'react-hook-form';

export const useProfile = () => {
  const { user, authFetch, refreshUser } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  // --- ESTADOS ---
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Datos Estudiante
  const [requests, setRequests] = useState([]);
  
  // Datos Administrador (NUEVO: Para métricas reales)
  const [adminStats, setAdminStats] = useState({
    total: 0, pendientes: 0, aprobadas: 0, avales: 0
  });

  const [uploading, setUploading] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [addingExp, setAddingExp] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const forms = {
    profile: useForm(),
    exp: useForm(),
    cert: useForm(),
    tutor: useForm()
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  // --- CARGA DE DATOS ---
  
  // 1. Cargar Solicitudes (Solo Estudiante)
  const fetchRequests = useCallback(async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/tutor-requests');
      if (res.ok) setRequests(await res.json());
    } catch (e) { console.error(e); }
  }, [authFetch]);

  // 2. Cargar Estadísticas Reales (Solo Admin)
  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) { console.error("Error cargando stats:", e); }
  }, [authFetch]);

  useEffect(() => {
    if (user) forms.profile.reset({ name: user.name });
    
    // Carga condicional según el rol
    if (isStudent) fetchRequests();
    if (isAdmin) fetchAdminStats(); 

  }, [user, isStudent, isAdmin, fetchRequests, fetchAdminStats, forms.profile]);

  // --- HANDLERS (Tus funciones originales se mantienen igual) ---

  const handleDownloadMemo = async (filename) => {
    if (!filename) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/uploads/${filename}`, {
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
    } catch (error) { showNotification('❌ Error al descargar', 'error'); }
  };

  const onAddExperience = async (data) => {
    setAddingExp(true);
    try {
      const res = await authFetch('http://localhost:5001/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshUser();
        showNotification('✅ Experiencia agregada', 'success');
        forms.exp.reset();
      }
    } catch (e) { showNotification('Error de conexión', 'error'); } 
    finally { setAddingExp(false); }
  };

  const onAddCert = async (data) => {
    setAddingCert(true);
    try {
      const res = await authFetch('http://localhost:5001/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshUser();
        showNotification('✅ Curso agregado', 'success');
        forms.cert.reset();
      }
    } catch (e) { showNotification('Error de conexión', 'error'); } 
    finally { setAddingCert(false); }
  };

  const onUpdateProfile = async (data) => {
    setUpdating(true);
    try {
      const payload = { name: data.name };
      if (data.password) payload.password = data.password;
      const res = await authFetch('http://localhost:5001/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await refreshUser();
        showNotification('✅ Perfil actualizado', 'success');
        setIsEditing(false);
        forms.profile.reset({ name: data.name, password: '' });
      }
    } catch (e) { console.error(e); } finally { setUpdating(false); }
  };

  const onUploadTutor = async (data) => {
    const file = data.file[0];
    if (!file) return showNotification('Falta el archivo', 'error');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.docTitle);
    try {
      let token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/tutor-requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        showNotification('✅ Solicitud enviada', 'success');
        forms.tutor.reset();
        fetchRequests();
      }
    } catch (e) { showNotification('Error conexión', 'error'); } finally { setUploading(false); }
  };

  const handleDeleteExp = async (id) => {
    if (!window.confirm('¿Eliminar esta experiencia?')) return;
    try {
      const res = await authFetch(`http://localhost:5001/api/experience/${id}`, { method: 'DELETE' });
      if (res.ok) { await refreshUser(); showNotification('🗑️ Eliminado', 'success'); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    try {
      const res = await authFetch(`http://localhost:5001/api/certifications/${id}`, { method: 'DELETE' });
      if (res.ok) { await refreshUser(); showNotification('🗑️ Eliminado', 'success'); }
    } catch (e) { console.error(e); }
  };

  const closeNotification = () => setNotification({ ...notification, show: false });

  return {
    data: { user, isStudent, requests, adminStats }, // 👈 Exportamos adminStats
    loading: { updating, uploading, addingCert, addingExp },
    modals: { isEditing, setIsEditing },
    notification: { ...notification, close: closeNotification },
    forms,
    actions: {
      onAddExperience, onAddCert, onUpdateProfile, onUploadTutor,
      handleDeleteExp, handleDeleteCert, handleDownloadMemo
    }
  };
};