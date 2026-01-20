import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  BookOpen,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  X,
  Loader,
  Award,
  Check,
  AlertTriangle,
  Printer,
} from 'lucide-react';

const AdminRequests = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');

  const [applications, setApplications] = useState([]);
  const [tutorRequests, setTutorRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [tutorInput, setTutorInput] = useState({});

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // --- NOTIFICACIONES ---
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
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'jobs') {
        const res = await authFetch(
          'http://localhost:5001/api/admin/applications'
        );
        if (res.ok) setApplications((await res.json()).reverse());
      } else {
        const res = await authFetch(
          'http://localhost:5001/api/admin/tutor-requests'
        );
        if (res.ok) setTutorRequests(await res.json());
      }
    } catch (e) {
      console.error(e);
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
        showNotification(`Solicitud marcada como ${newStatus}`, 'success');
      }
    } catch (error) {
      showNotification('Error al actualizar estado', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewCV = (studentId) =>
    window.open(`http://localhost:5001/api/cv/${studentId}`, '_blank');

  const handleDownloadReport = async (studentId, studentName) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/export-pdf/${studentId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${studentName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('CV ATS-Friendly descargado', 'success');
      } else {
        showNotification('No se pudo generar el reporte.', 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- NUEVA FUNCIÓN: DESCARGAR MEMORANDO ---
  const handleDownloadMemo = async (requestId, studentName) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:5001/api/admin/export-assignment/${requestId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Memorando_${studentName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('Memorando descargado', 'success');
      } else {
        showNotification('Error al descargar memorando', 'error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenProfile = async (studentId) => {
    setShowProfileModal(true);
    setLoadingProfile(true);
    setSelectedStudent(null);
    try {
      const res = await authFetch(
        `http://localhost:5001/api/profile/${studentId}`
      );
      if (res.ok) setSelectedStudent(await res.json());
      else {
        showNotification('No se pudo cargar el perfil', 'error');
        setShowProfileModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleApproveTutor = async (id) => {
    const name = tutorInput[id];
    if (!name)
      return showNotification('Escribe el nombre del tutor primero', 'error');
    const res = await authFetch(
      `http://localhost:5001/api/admin/tutor-requests/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Aprobado', tutor_name: name }),
      }
    );
    if (res.ok) {
      showNotification('✅ Tutor asignado con éxito', 'success');
      fetchData();
    } else {
      showNotification('Error al asignar tutor', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 relative min-h-screen">
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

      <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-6">
        Gestión de Solicitudes
      </h1>
      <div className="flex gap-6 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-4 px-2 font-bold transition-all flex items-center gap-2 ${activeTab === 'jobs' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Briefcase size={20} /> Postulaciones (Empleo)
        </button>
        <button
          onClick={() => setActiveTab('tutors')}
          className={`pb-4 px-2 font-bold transition-all flex items-center gap-2 ${activeTab === 'tutors' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BookOpen size={20} /> Solicitudes de Tutor
        </button>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
            <div className="p-6 overflow-y-auto">
              {loadingProfile ? (
                <Loader className="animate-spin mx-auto text-blue-600" />
              ) : selectedStudent ? (
                <div className="space-y-6">
                  <div className="text-center">
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
                    {selectedStudent.certifications?.length > 0 ? (
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
                      <p className="text-slate-400 italic text-sm text-center">
                        Sin certificaciones.
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
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <Loader className="animate-spin mx-auto text-blue-600" />
        </div>
      ) : (
        <>
          {activeTab === 'jobs' && (
            <div className="grid gap-4">
              {applications.length === 0 && (
                <p className="text-center text-slate-400">
                  No hay postulaciones.
                </p>
              )}
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      {app.student_name ? (
                        app.student_name.charAt(0)
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg uppercase">
                        {app.opportunity_title}
                      </h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                          <User size={14} className="text-blue-500" />{' '}
                          Estudiante:{' '}
                          <span className="text-slate-900 font-bold">
                            {app.student_name}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-bold uppercase">
                          <Calendar size={12} /> Fecha: {app.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                    <button
                      onClick={() => handleOpenProfile(app.student_id)}
                      className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition shadow-sm"
                      title="Ver Perfil"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleViewCV(app.student_id)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm"
                      title="Ver CV"
                    >
                      <FileText size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadReport(
                          app.student_id,
                          app.student_name || 'Estudiante'
                        )
                      }
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition shadow-sm"
                      title="Descargar CV ATS"
                    >
                      <Download size={20} />
                    </button>
                    <div
                      className={`mx-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${app.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : ''} ${app.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' : ''} ${app.status === 'Rechazado' ? 'bg-rose-100 text-rose-700' : ''}`}
                    >
                      {app.status}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleStatusChange(app.id, 'Aprobado')}
                        disabled={app.status === 'Aprobado'}
                        className="p-1 rounded-full hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 disabled:opacity-30 transition"
                      >
                        <CheckCircle size={28} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, 'Rechazado')}
                        disabled={app.status === 'Rechazado'}
                        className="p-1 rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-600 disabled:opacity-30 transition"
                      >
                        <XCircle size={28} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'tutors' && (
            <div className="grid gap-4">
              {tutorRequests.length === 0 && (
                <p className="text-center text-slate-400">
                  No hay solicitudes de tutor.
                </p>
              )}
              {tutorRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {req.student_name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Documento: {req.title}
                      </p>
                      <a
                        href={`http://localhost:5001/api/uploads/${req.filename}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-bold"
                      >
                        <Download size={12} /> Descargar Evidencia
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {req.status === 'Pendiente' ? (
                      <>
                        <input
                          type="text"
                          placeholder="Escribe el Tutor (Ej: Ing. Perez)..."
                          className="p-2 border border-slate-300 rounded-lg text-sm w-full md:w-64 outline-none focus:border-blue-500 transition"
                          onChange={(e) =>
                            setTutorInput({
                              ...tutorInput,
                              [req.id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleApproveTutor(req.id)}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 text-sm whitespace-nowrap shadow-lg shadow-emerald-200/50"
                        >
                          Asignar y Aprobar
                        </button>
                      </>
                    ) : (
                      <div className="text-right px-4 flex items-center gap-4">
                        <div>
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 justify-end">
                            <CheckCircle size={12} /> Tutor Asignado
                          </span>
                          <p className="text-sm text-slate-600">
                            Docente:{' '}
                            <strong className="text-slate-900">
                              {req.tutor_name}
                            </strong>
                          </p>
                        </div>
                        {/* --- BOTÓN NUEVO DE DESCARGAR MEMORANDO --- */}
                        <button
                          onClick={() =>
                            handleDownloadMemo(req.id, req.student_name)
                          }
                          className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600 transition"
                          title="Imprimir Memorando"
                        >
                          <Printer size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AdminRequests;
