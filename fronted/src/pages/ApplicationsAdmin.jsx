import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Briefcase,
  Loader,
  FileText,
  X,
  Award,
  Eye,
} from 'lucide-react';

const ApplicationsAdmin = () => {
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ESTADO PARA EL MODAL DE PERFIL
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await authFetch('http://localhost:5001/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.reverse());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setProcessingId(appId);
    try {
      const res = await authFetch(
        `http://localhost:5001/api/applications/${appId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewCV = async (studentId) => {
    const url = `http://localhost:5001/api/cv/${studentId}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) window.open(url, '_blank');
      else alert('⚠️ Este estudiante aún no ha cargado su Hoja de Vida.');
    } catch (error) {
      alert('Error al verificar el archivo.');
    }
  };

  // --- NUEVA FUNCIÓN: ABRIR MODAL DE PERFIL ---
  const handleOpenProfile = async (studentId) => {
    setShowProfileModal(true);
    setLoadingProfile(true);
    setSelectedStudent(null);
    try {
      const res = await authFetch(
        `http://localhost:5001/api/profile/${studentId}`
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedStudent(data);
      } else {
        alert('No se pudo cargar el perfil');
        setShowProfileModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 relative">
      <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-8">
        Gestión de Postulaciones
      </h1>

      {/* --- MODAL PANTALLA SOBREPUESTA --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Perfil del
                Estudiante
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto">
              {loadingProfile ? (
                <div className="py-10 text-center">
                  <Loader className="animate-spin mx-auto text-blue-600" />
                </div>
              ) : selectedStudent ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mx-auto text-2xl mb-3">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-slate-500">{selectedStudent.email}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Award className="text-orange-500" size={18} /> Cursos y
                      Certificaciones
                    </h4>
                    {selectedStudent.certifications &&
                    selectedStudent.certifications.length > 0 ? (
                      <div className="grid gap-3">
                        {selectedStudent.certifications.map((cert) => (
                          <div
                            key={cert.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-slate-800">
                                {cert.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {cert.institution}
                              </p>
                            </div>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200">
                              {cert.year}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-sm text-center bg-slate-50 p-4 rounded-xl">
                        El estudiante no ha registrado información adicional.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-red-500 text-center">
                  Error al cargar datos.
                </p>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LISTA DE POSTULACIONES --- */}
      {loading ? (
        <div className="text-center py-10">
          <Loader className="animate-spin mx-auto text-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 font-bold">
            No hay postulaciones registradas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {app.opportunity_title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> ID: {app.student_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {app.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                {/* BOTÓN VER PERFIL (OJO) */}
                <button
                  onClick={() => handleOpenProfile(app.student_id)}
                  className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                  title="Ver Perfil Completo"
                >
                  <Eye size={20} />
                </button>

                {/* BOTÓN VER CV */}
                <button
                  onClick={() => handleViewCV(app.student_id)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  title="Ver PDF"
                >
                  <FileText size={20} />
                </button>

                <div
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${app.status === 'Pendiente' ? 'bg-yellow-50 text-yellow-600' : ''} ${app.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-600' : ''} ${app.status === 'Rechazado' ? 'bg-rose-50 text-rose-600' : ''}`}
                >
                  {app.status}
                </div>

                {processingId === app.id ? (
                  <Loader size={20} className="animate-spin text-slate-400" />
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(app.id, 'Aprobado')}
                      disabled={app.status === 'Aprobado'}
                      className="p-2 rounded-full hover:bg-emerald-50 text-slate-300 hover:text-emerald-600"
                    >
                      <CheckCircle size={24} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id, 'Rechazado')}
                      disabled={app.status === 'Rechazado'}
                      className="p-2 rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-600"
                    >
                      <XCircle size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ApplicationsAdmin;
