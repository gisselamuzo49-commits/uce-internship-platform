import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  Shield,
  LayoutDashboard,
  Users,
  FileBarChart,
} from 'lucide-react';

const UserProfile = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student'; // Flag para saber si es estudiante

  // --- ESTADOS COMUNES ---
  const [isEditing, setIsEditing] = useState(false); // Modal editar datos
  const [editData, setEditData] = useState({ name: '', password: '' });
  const [updating, setUpdating] = useState(false);

  // --- ESTADOS DE ESTUDIANTE ---
  const [requests, setRequests] = useState([]); // Solicitudes Tutor
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [certForm, setCertForm] = useState({
    title: '',
    institution: '',
    year: new Date().getFullYear(),
  });
  const [addingCert, setAddingCert] = useState(false);

  // Cargamos datos al inicio
  useEffect(() => {
    if (user) {
      setEditData({ name: user.name, password: '' });
      if (isStudent) fetchRequests();
    }
  }, [user, isStudent]);

  const fetchRequests = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/tutor-requests');
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // --- FUNCIONALIDAD 1: AGREGAR CURSO (ESTUDIANTE) ---
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
        alert('✅ Curso agregado correctamente.');
        setCertForm({
          title: '',
          institution: '',
          year: new Date().getFullYear(),
        });
        window.location.reload(); // Recargamos para actualizar lista y gráfica del dashboard
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingCert(false);
    }
  };

  // --- FUNCIONALIDAD 2: BORRAR CURSO (ESTUDIANTE) ---
  const handleDeleteCert = async (id) => {
    // Confirmación antes de borrar
    if (
      !window.confirm(
        '¿Estás seguro de que quieres eliminar este curso? Tu nivel de perfil bajará.'
      )
    )
      return;

    try {
      const res = await authFetch(
        `http://localhost:5001/api/certifications/${id}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        alert('🗑️ Curso eliminado.');
        window.location.reload(); // Recargamos para ver los cambios
      } else {
        alert('Error al eliminar.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- FUNCIONALIDAD 3: TUTOR (ESTUDIANTE) ---
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

  // --- FUNCIONALIDAD 4: EDITAR PERFIL (AMBOS) ---
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

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 relative space-y-8 min-h-screen">
      {/* --- HEADER DEL PERFIL (COMÚN PARA AMBOS) --- */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div
          className={`h-32 relative bg-gradient-to-r ${isStudent ? 'from-blue-600 to-indigo-700' : 'from-slate-800 to-slate-900'}`}
        >
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-4 border-white">
              <User size={40} />
            </div>
          </div>
          {/* El Admin edita sus datos directamente en el panel de abajo, el estudiante usa modal */}
          {isStudent && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-4 right-8 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
            >
              <Edit size={16} /> Editar Datos
            </button>
          )}
        </div>
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-3xl font-black text-slate-800">{user.name}</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Mail size={14} /> {user.email}
          </p>
          <span
            className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${isStudent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}
          >
            {isStudent ? 'Estudiante' : 'Administrador del Sistema'}
          </span>
        </div>
      </div>

      {/* =========================================================
          VISTA DEL ADMINISTRADOR (PANEL DE CONTROL)
         ========================================================= */}
      {!isStudent && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* TARJETA 1: SEGURIDAD (CAMBIO DE CLAVE DIRECTO) */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Shield className="text-emerald-500" /> Seguridad de la Cuenta
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={16}
                  />
                  <input
                    type="password"
                    placeholder="Ingresa nueva contraseña"
                    value={editData.password}
                    onChange={(e) =>
                      setEditData({ ...editData, password: e.target.value })
                    }
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">
                  Deja vacío si no quieres cambiarla.
                </p>
              </div>
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-lg"
              >
                {updating ? 'Guardando...' : 'Actualizar Credenciales'}
              </button>
            </form>
          </div>

          {/* TARJETA 2: RESUMEN OPERATIVO (LINKS RÁPIDOS) */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <LayoutDashboard className="text-blue-600" /> Resumen Operativo
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Accesos directos a la gestión de la plataforma.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/postulaciones')}
                  className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl flex items-center gap-4 transition text-left group"
                >
                  <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 group-hover:text-blue-700">
                      Gestionar Postulantes
                    </p>
                    <p className="text-xs text-blue-600/70">
                      Revisar CVs y asignaciones
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/postulaciones')}
                  className="w-full p-4 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl flex items-center gap-4 transition text-left group"
                >
                  <div className="bg-white p-2 rounded-lg text-orange-600 shadow-sm">
                    <FileBarChart size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 group-hover:text-orange-700">
                      Solicitudes de Tutor
                    </p>
                    <p className="text-xs text-orange-600/70">
                      Formalización de prácticas
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Sistema SIIU Conecta v1.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VISTA DEL ESTUDIANTE (CURSOS Y TUTOR)
         ========================================================= */}
      {isStudent && (
        <>
          {/* SECCIÓN 1: FORMACIÓN ACADÉMICA */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="text-orange-500" /> Formación y Cursos
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Formulario Agregar */}
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
                        setCertForm({
                          ...certForm,
                          institution: e.target.value,
                        })
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

              {/* Lista con Botón de Borrar */}
              <div>
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
                  Mis Certificaciones Actuales
                </h3>
                {user.certifications && user.certifications.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {user.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-white hover:shadow-md transition"
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
                        {/* BOTÓN DE BORRAR REPARADO */}
                        <button
                          onClick={() => handleDeleteCert(cert.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar curso"
                        >
                          <Trash2 size={18} />
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

          {/* SECCIÓN 2: FORMALIZACIÓN (TUTOR) */}
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

          {/* MODAL DE EDICIÓN PARA ESTUDIANTE */}
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
                    placeholder="Nueva Contraseña (Opcional)"
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
        </>
      )}
    </div>
  );
};

export default UserProfile;
