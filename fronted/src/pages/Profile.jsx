import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Award,
  BookOpen,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  X,
  Lock,
  Plus,
  Trash2,
  GraduationCap,
} from 'lucide-react';

const UserProfile = () => {
  const { user, authFetch } = useAuth();

  // --- ESTADOS ---
  const [requests, setRequests] = useState([]); // Solicitudes Tutor
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Estados Edición Perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', password: '' });
  const [updating, setUpdating] = useState(false);

  // Estados Certificaciones (NUEVO)
  const [certForm, setCertForm] = useState({
    title: '',
    institution: '',
    year: new Date().getFullYear(),
  });
  const [addingCert, setAddingCert] = useState(false);

  useEffect(() => {
    fetchRequests();
    if (user) {
      setEditData({ name: user.name, password: '' });
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/tutor-requests');
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOGICA CERTIFICACIONES ---
  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!certForm.title || !certForm.institution) return;
    setAddingCert(true);
    try {
      const res = await authFetch('http://localhost:5001/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certForm),
      });
      if (res.ok) {
        alert('✅ Curso agregado. Tu nivel de perfil subirá.');
        setCertForm({
          title: '',
          institution: '',
          year: new Date().getFullYear(),
        });
        window.location.reload(); // Recargamos para actualizar la lista y el nivel
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingCert(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('¿Borrar este curso?')) return;
    try {
      const res = await authFetch(
        `http://localhost:5001/api/certifications/${id}`,
        { method: 'DELETE' }
      );
      if (res.ok) window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOGICA TUTOR ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = document.getElementById('req-file').files[0];
    if (!file || !docTitle) return alert('Faltan datos');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', docTitle);
    try {
      let token = localStorage.getItem('token').replace(/^"|"$/g, '').trim();
      const res = await fetch('http://localhost:5001/api/tutor-requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert('✅ Solicitud enviada correctamente');
        setDocTitle('');
        document.getElementById('req-file').value = '';
        fetchRequests();
      } else {
        alert('❌ Error al subir');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  // --- LOGICA EDITAR PERFIL ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = { name: editData.name };
      if (editData.password) payload.password = editData.password;
      const res = await authFetch('http://localhost:5001/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('✅ Perfil actualizado. Inicia sesión de nuevo.');
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
      setIsEditing(false);
    }
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 relative space-y-8">
      {/* MODAL EDICIÓN */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/80 z-[9999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Editar Datos</h3>
              <button onClick={() => setIsEditing(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
                placeholder="Nombre"
              />
              <input
                type="password"
                value={editData.password}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
                placeholder="Nueva Contraseña"
              />
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
              >
                {updating ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. HEADER PERFIL */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-4 border-white">
              <User size={40} />
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-4 right-8 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
          >
            <Edit size={16} /> Editar
          </button>
        </div>
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-3xl font-black text-slate-800">{user.name}</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Mail size={14} /> {user.email}
          </p>
          <span className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {user.role}
          </span>
        </div>
      </div>

      {/* 2. FORMACIÓN ACADÉMICA (NUEVO SECCIÓN) */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Award className="text-orange-500" /> Formación y Cursos
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 h-fit">
            <h3 className="font-bold text-orange-800 mb-4 text-sm uppercase">
              Agregar Nuevo Curso
            </h3>
            <form onSubmit={handleAddCert} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del Curso / Título"
                className="w-full p-3 bg-white border border-orange-200 rounded-xl text-sm"
                value={certForm.title}
                onChange={(e) =>
                  setCertForm({ ...certForm, title: e.target.value })
                }
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Institución"
                  className="w-2/3 p-3 bg-white border border-orange-200 rounded-xl text-sm"
                  value={certForm.institution}
                  onChange={(e) =>
                    setCertForm({ ...certForm, institution: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Año"
                  className="w-1/3 p-3 bg-white border border-orange-200 rounded-xl text-sm"
                  value={certForm.year}
                  onChange={(e) =>
                    setCertForm({ ...certForm, year: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addingCert}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition flex justify-center gap-2 items-center"
              >
                {addingCert ? (
                  'Guardando...'
                ) : (
                  <>
                    <Plus size={18} /> Agregar al Perfil
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div>
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
              Mis Certificaciones Actuales
            </h3>
            {user.certifications && user.certifications.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {user.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-slate-100 text-orange-500">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {cert.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cert.institution} • {cert.year}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-slate-300 hover:text-red-500 transition p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-400 text-sm">
                  Aún no has agregado cursos.
                </p>
                <p className="text-orange-400 text-xs font-bold mt-1">
                  ¡Agrega uno para subir tu nivel!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FORMALIZACIÓN (TUTOR) */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Formalización de Prácticas
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
              Solicitar Tutor
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Título del Documento"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                required
              />
              <input
                type="file"
                id="req-file"
                accept=".pdf"
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 text-sm"
              >
                {uploading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
              Mis Solicitudes
            </h3>
            {requests.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin solicitudes.</p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {req.title}
                    </p>
                    <p className="text-xs text-slate-400">{req.date}</p>
                  </div>
                  <div className="text-right">
                    {req.status === 'Pendiente' && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                        Pendiente
                      </span>
                    )}
                    {req.status === 'Aprobado' && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        Aprobado
                      </span>
                    )}
                    {req.status === 'Aprobado' && (
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        {req.tutor_name}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
