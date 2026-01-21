import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Award,
  BookOpen,
  Upload,
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
  AlertTriangle,
  CheckCircle,
  Info,
  Briefcase,
} from 'lucide-react';

const UserProfile = () => {
  const { user, authFetch, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', password: '' });
  const [updating, setUpdating] = useState(false);

  // Estados Tutoría
  const [requests, setRequests] = useState([]);
  const [docTitle, setDocTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Estados Certificaciones
  const [certForm, setCertForm] = useState({
    title: '',
    institution: '',
    year: new Date().getFullYear(),
  });
  const [addingCert, setAddingCert] = useState(false);

  // Estados EXPERIENCIA LABORAL (NUEVO)
  const [expForm, setExpForm] = useState({
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [addingExp, setAddingExp] = useState(false);

  // Notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: '', type: '' }),
      4000
    );
  };

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

  // --- LOGICA EXPERIENCIA (NUEVO) ---
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!expForm.company || !expForm.role) return;
    setAddingExp(true);
    try {
      const res = await authFetch('http://localhost:5001/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expForm),
      });
      if (res.ok) {
        await refreshUser();
        showNotification('✅ Experiencia agregada', 'success');
        setExpForm({
          company: '',
          role: '',
          start_date: '',
          end_date: '',
          description: '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingExp(false);
    }
  };

  const handleDeleteExp = async (id) => {
    if (!window.confirm('¿Eliminar esta experiencia?')) return;
    try {
      const res = await authFetch(
        `http://localhost:5001/api/experience/${id}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        await refreshUser();
        showNotification('🗑️ Experiencia eliminada', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Logica Certificaciones
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
        await refreshUser();
        showNotification('✅ Curso agregado correctamente', 'success');
        setCertForm({
          title: '',
          institution: '',
          year: new Date().getFullYear(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingCert(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    try {
      const res = await authFetch(
        `http://localhost:5001/api/certifications/${id}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        await refreshUser();
        showNotification('🗑️ Curso eliminado', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        await refreshUser();
        showNotification('✅ Perfil actualizado', 'success');
        setIsEditing(false);
        setEditData((prev) => ({ ...prev, password: '' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = document.getElementById('req-file').files[0];
    if (!file || !docTitle) return showNotification('Faltan datos', 'error');
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
        showNotification('✅ Solicitud enviada', 'success');
        setDocTitle('');
        document.getElementById('req-file').value = '';
        fetchRequests();
      } else {
        showNotification('Error al subir', 'error');
      }
    } catch (e) {
      showNotification('Error conexión', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 relative space-y-8 min-h-screen">
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
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 hover:bg-white/20 p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isStudent && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-4 shadow-sm animate-in slide-in-from-top-4">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
            <Info size={24} />
          </div>
          <div>
            <h3 className="font-bold text-amber-800 text-lg">
              ATENCIÓN: Información Obligatoria
            </h3>
            <p className="text-amber-700 text-sm mt-1">
              Para que tu perfil sea considerado, es obligatorio completar la
              Experiencia Laboral y Cursos.
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div
          className={`h-32 relative bg-gradient-to-r ${isStudent ? 'from-blue-600 to-indigo-700' : 'from-slate-800 to-slate-900'}`}
        >
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-4 border-white">
              <User size={40} />
            </div>
          </div>
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
            {isStudent ? 'Estudiante' : 'Administrador'}
          </span>
        </div>
      </div>

      {!isStudent && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Shield className="text-emerald-500" /> Seguridad
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nombre
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
                    placeholder="Opcional"
                    value={editData.password}
                    onChange={(e) =>
                      setEditData({ ...editData, password: e.target.value })
                    }
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
              >
                {updating ? '...' : 'Actualizar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isStudent && (
        <>
          {/* SECCIÓN NUEVA: EXPERIENCIA LABORAL */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase className="text-purple-600" /> Experiencia Laboral
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 h-fit">
                <h3 className="font-bold text-purple-800 mb-4 text-sm uppercase">
                  Agregar Experiencia
                </h3>
                <form onSubmit={handleAddExperience} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Cargo / Rol"
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                    value={expForm.role}
                    onChange={(e) =>
                      setExpForm({ ...expForm, role: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nombre de la Empresa"
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                    value={expForm.company}
                    onChange={(e) =>
                      setExpForm({ ...expForm, company: e.target.value })
                    }
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Fecha Inicio (Ej: 2022)"
                      className="w-1/2 p-3 bg-white border border-purple-200 rounded-xl text-sm"
                      value={expForm.start_date}
                      onChange={(e) =>
                        setExpForm({ ...expForm, start_date: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Fecha Fin"
                      className="w-1/2 p-3 bg-white border border-purple-200 rounded-xl text-sm"
                      value={expForm.end_date}
                      onChange={(e) =>
                        setExpForm({ ...expForm, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Descripción breve de actividades..."
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                    rows="3"
                    value={expForm.description}
                    onChange={(e) =>
                      setExpForm({ ...expForm, description: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    disabled={addingExp}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex justify-center gap-2 items-center"
                  >
                    {addingExp ? (
                      '...'
                    ) : (
                      <>
                        <Plus size={18} /> Agregar Experiencia
                      </>
                    )}
                  </button>
                </form>
              </div>
              <div>
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
                  Mis Experiencias
                </h3>
                {user.experiences?.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {user.experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition relative group"
                      >
                        <button
                          onClick={() => handleDeleteExp(exp.id)}
                          className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <h4 className="font-bold text-slate-800">{exp.role}</h4>
                        <p className="text-sm text-slate-500 font-bold mb-1">
                          {exp.company} • {exp.start_date} - {exp.end_date}
                        </p>
                        <p className="text-xs text-slate-600">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-400 text-sm">
                      Sin experiencia registrada.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="text-orange-500" /> Formación
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 h-fit">
                <h3 className="font-bold text-orange-800 mb-4 text-sm uppercase">
                  Agregar Curso
                </h3>
                <form onSubmit={handleAddCert} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título"
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
                      '...'
                    ) : (
                      <>
                        <Plus size={18} /> Agregar
                      </>
                    )}
                  </button>
                </form>
              </div>
              <div>
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
                  Mis Certificaciones
                </h3>
                {user.certifications?.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {user.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition"
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
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-400 text-sm">Sin cursos aún.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-600" /> Formalización
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
                  Solicitar Tutor
                </h3>
                <form onSubmit={handleUpload} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título Documento"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    required
                  />
                  <input
                    type="file"
                    id="req-file"
                    accept=".pdf"
                    className="w-full text-sm text-slate-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 text-sm"
                  >
                    {uploading ? '...' : 'Enviar'}
                  </button>
                </form>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
                  Solicitudes
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
                    {updating ? '...' : 'Guardar'}
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
