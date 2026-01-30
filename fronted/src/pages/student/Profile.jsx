import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Award,
  BookOpen,
  Edit,
  X,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  UserCheck, // Nuevo icono para el tutor
} from 'lucide-react';

const UserProfile = () => {
  const { user, authFetch, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';

  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [requests, setRequests] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [addingExp, setAddingExp] = useState(false);

  // --- CONFIGURACIÓN DE FORMULARIOS ---
  const {
    register: regProfile,
    handleSubmit: submitProfile,
    reset: resetProfile,
  } = useForm();
  const {
    register: regExp,
    handleSubmit: submitExp,
    reset: resetExp,
  } = useForm();
  const {
    register: regCert,
    handleSubmit: submitCert,
    reset: resetCert,
  } = useForm();
  const {
    register: regTutor,
    handleSubmit: submitTutor,
    reset: resetTutor,
  } = useForm();

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
    if (user && isStudent) fetchRequests();
    if (user) resetProfile({ name: user.name });
  }, [user, isStudent, resetProfile]);

  const fetchRequests = async () => {
    try {
      // Esta ruta debe devolver assigned_tutor y tutor_email gracias a tu cambio en models.py
      const res = await authFetch('http://localhost:5001/api/tutor-requests');
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // --- LÓGICA EXPERIENCIA ---
  const onAddExperience = async (data) => {
    setAddingExp(true);
    try {
      const res = await authFetch('http://localhost:5001/api/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        await refreshUser();
        showNotification('✅ Experiencia agregada', 'success');
        resetExp();
      } else {
        showNotification(
          `❌ Error: ${result.error || 'Fallo al guardar'}`,
          'error'
        );
      }
    } catch (e) {
      showNotification('❌ Error de conexión', 'error');
    } finally {
      setAddingExp(false);
    }
  };

  // --- LÓGICA CERTIFICACIONES ---
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
        resetCert();
      } else {
        showNotification('❌ Error al agregar curso', 'error');
      }
    } catch (e) {
      showNotification('❌ Error de conexión', 'error');
    } finally {
      setAddingCert(false);
    }
  };

  // --- LÓGICA ACTUALIZAR PERFIL ---
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
        resetProfile({ name: data.name, password: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  // --- LÓGICA SUBIDA (TUTOR) ---
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
        resetTutor();
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
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 hover:bg-white/20 p-1 rounded-full"
          >
            <X size={16} />
          </button>
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

      {/* SECCIONES ESTUDIANTE */}
      {isStudent && (
        <>
          {/* EXPERIENCIA LABORAL */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase className="text-purple-600" /> Experiencia Laboral
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 h-fit">
                <form
                  onSubmit={submitExp(onAddExperience)}
                  className="space-y-3"
                >
                  <input
                    {...regExp('role', { required: true })}
                    type="text"
                    placeholder="Cargo / Rol"
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                  />
                  <input
                    {...regExp('company', { required: true })}
                    type="text"
                    placeholder="Nombre de la Empresa"
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-purple-700 ml-1">
                        INICIO
                      </label>
                      <input
                        {...regExp('start_date', { required: true })}
                        type="date"
                        className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-700 ml-1">
                        FIN
                      </label>
                      <input
                        {...regExp('end_date')}
                        type="date"
                        className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <textarea
                    {...regExp('description')}
                    placeholder="Descripción breve..."
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                    rows="3"
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
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {user.experiences?.length === 0 && (
                    <p className="text-sm text-slate-400 italic">
                      No has agregado experiencia.
                    </p>
                  )}
                  {user.experiences?.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative group"
                    >
                      <button
                        onClick={() => handleDeleteExp(exp.id)}
                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      <h4 className="font-bold text-slate-800">{exp.role}</h4>
                      <p className="text-sm text-slate-500 font-bold">
                        {exp.company} • {exp.start_date} -{' '}
                        {exp.end_date || 'Presente'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FORMACIÓN */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="text-orange-500" /> Formación
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 h-fit">
                <form onSubmit={submitCert(onAddCert)} className="space-y-3">
                  <input
                    {...regCert('title', { required: true })}
                    type="text"
                    placeholder="Título"
                    className="w-full p-3 bg-white border border-orange-200 rounded-xl text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      {...regCert('institution', { required: true })}
                      type="text"
                      placeholder="Institución"
                      className="w-2/3 p-3 bg-white border border-orange-200 rounded-xl text-sm"
                    />
                    <input
                      {...regCert('year', { required: true })}
                      type="number"
                      placeholder="Año"
                      className="w-1/3 p-3 bg-white border border-orange-200 rounded-xl text-sm"
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
                        <Plus size={18} /> Agregar Curso
                      </>
                    )}
                  </button>
                </form>
              </div>
              <div className="space-y-3">
                {user.certifications?.length === 0 && (
                  <p className="text-sm text-slate-400 italic">
                    No has agregado cursos.
                  </p>
                )}
                {user.certifications?.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg text-orange-500">
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
                      className="p-2 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FORMALIZACIÓN (TUTOR) - ¡ACTUALIZADO AQUÍ! */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-600" /> Formalización
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <form
                  onSubmit={submitTutor(onUploadTutor)}
                  className="space-y-4"
                >
                  <input
                    {...regTutor('docTitle', { required: true })}
                    type="text"
                    placeholder="Título Documento"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <input
                    {...regTutor('file', { required: true })}
                    type="file"
                    accept=".pdf"
                    className="w-full text-sm text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                  >
                    {uploading ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              </div>
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
                  >
                    {/* Encabezado de la solicitud */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {req.title}
                        </p>
                        <p className="text-xs text-slate-400">{req.date}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${req.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : req.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* 👇 AQUÍ MOSTRAMOS AL TUTOR Y SU CORREO 👇 */}
                    {req.assigned_tutor && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                          <UserCheck size={14} /> Docente Asignado
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {req.assigned_tutor}
                        </p>
                        {req.tutor_email && (
                          <p className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium">
                            <Mail size={12} /> {req.tutor_email}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-slate-400 text-sm italic text-center py-4">
                    No has enviado documentos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL EDICIÓN PERFIL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/80 z-[9999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Editar Datos</h3>
              <button onClick={() => setIsEditing(false)}>
                <X />
              </button>
            </div>
            <form
              onSubmit={submitProfile(onUpdateProfile)}
              className="space-y-4"
            >
              <input
                {...regProfile('name', { required: true })}
                type="text"
                className="w-full p-3 border rounded-xl"
                placeholder="Nombre"
              />
              <input
                {...regProfile('password')}
                type="password"
                placeholder="Nueva Contraseña"
                className="w-full p-3 border rounded-xl"
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
    </div>
  );
};

export default UserProfile;
