import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import {
  CheckCircle,
  XCircle,
  FileText,
  Briefcase,
  Download,
  Search,
  Filter,
  UserPlus,
  Loader,
  Eye,
  GraduationCap,
  X,
  Mail,
  AlertTriangle,
  Upload,
  Paperclip,
} from 'lucide-react';

// Centralized API URL import
import { API_URL } from '../../config/api';

const AdminRequests = () => {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  // Component state
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal state for viewing student profile
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [basicStudentInfo, setBasicStudentInfo] = useState(null);

  // Fetch applications
  const {
    data: applications,
    isLoading: loadingApps,
    isError: isErrorApps,
  } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/admin/applications`);
      if (!res.ok) throw new Error('Error al cargar postulaciones');
      return res.json();
    },
    retry: 1,
  });

  // Fetch tutor requests
  const {
    data: tutorRequests,
    isLoading: loadingTutor,
    isError: isErrorTutor,
  } = useQuery({
    queryKey: ['admin-tutor-requests'],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/admin/tutor-requests`);
      if (!res.ok) throw new Error('Error al cargar solicitudes de tutor');
      return res.json();
    },
    retry: 1,
  });

  // Fetch full student profile
  const { data: fullProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['student-profile', viewingStudentId],
    queryFn: async () => {
      if (!viewingStudentId) return null;
      const res = await authFetch(
        `${API_URL}/api/admin/students/${viewingStudentId}`
      );
      if (!res.ok) throw new Error('No se pudo cargar el perfil detallado');
      return res.json();
    },
    enabled: !!viewingStudentId,
  });

  // Upload memo/support document mutation
  const uploadMemoMutation = useMutation({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);

      // Obtenemos token manualmente para usar fetch puro
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_URL}/api/admin/tutor-requests/${id}/upload-memo`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Error al subir el memo');
      return res.json();
    },
    onSuccess: () => {
      alert('✅ Memo subido correctamente');
      queryClient.invalidateQueries(['admin-tutor-requests']);
    },
    onError: () => {
      alert('❌ Error al subir el archivo');
    },
  });

  const handleFileChange = (e, reqId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      uploadMemoMutation.mutate({ id: reqId, file });
    }
  };

  // Generate student CV as PDF
  const generateStudentCV = (profileData, fallbackData) => {
    const student = {
      name: fallbackData?.name || profileData?.name || 'Estudiante',
      email: fallbackData?.email || profileData?.email || 'Sin correo',
      experiences: profileData?.experiences || [],
      certifications: profileData?.certifications || [],
    };

    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138);
    doc.text(student.name, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(student.email, margin, y);
    y += 15;

    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 10;

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Experiencia Laboral', margin, y);
    y += 10;

    doc.setFontSize(11);
    if (student.experiences && student.experiences.length > 0) {
      student.experiences.forEach((exp) => {
        doc.setFont('helvetica', 'bold');
        doc.text(exp.role || 'Cargo', margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(
          `${exp.company} | ${exp.start_date} - ${exp.end_date || 'Presente'}`,
          margin,
          y
        );
        y += 7;
        if (exp.description) {
          const splitDesc = doc.splitTextToSize(exp.description, 170);
          doc.text(splitDesc, margin, y);
          y += splitDesc.length * 5 + 5;
        } else {
          y += 5;
        }
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No hay experiencia registrada.', margin, y);
      y += 10;
    }

    y += 5;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Formación y Cursos', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    if (student.certifications && student.certifications.length > 0) {
      student.certifications.forEach((cert) => {
        doc.text(
          `• ${cert.title} - ${cert.institution} (${cert.year})`,
          margin,
          y
        );
        y += 7;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No hay educación registrada.', margin, y);
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generado por Plataforma de Gestión', margin, 280);
    doc.save(`CV_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Update application or request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, type, status, tutor_name, tutor_email }) => {
      const body = { status };
      if (tutor_name) body.tutor_name = tutor_name;
      if (tutor_email) body.tutor_email = tutor_email;

      const res = await authFetch(`${API_URL}/api/admin/${type}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-applications']);
      queryClient.invalidateQueries(['admin-tutor-requests']);
    },
  });

  const handleStatusChange = (id, type, status) => {
    if (type === 'tutor-requests' && status === 'Aprobado') {
      const tutorName = prompt('✅ Ingresa el NOMBRE del Docente Tutor:');
      if (!tutorName?.trim()) return;
      const tutorEmail = prompt('📧 Ingresa el CORREO del Docente Tutor:');
      updateStatusMutation.mutate({
        id,
        type,
        status,
        tutor_name: tutorName,
        tutor_email: tutorEmail,
      });
    } else {
      if (
        window.confirm(`¿Seguro que deseas cambiar el estado a: ${status}?`)
      ) {
        updateStatusMutation.mutate({ id, type, status });
      }
    }
  };

  const handleOpenProfile = (item) => {
    const id = item.student_id || item.user_id;
    if (!id) return alert('Error: No se encontró el ID del estudiante.');
    setViewingStudentId(id);
    setBasicStudentInfo({
      name: item.student_name,
      email: item.student_email,
    });
  };

  const handleCloseProfile = () => {
    setViewingStudentId(null);
    setBasicStudentInfo(null);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'aprobado')
      return (
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">
          Aprobado
        </span>
      );
    if (s === 'rechazado')
      return (
        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-rose-200">
          Rechazado
        </span>
      );
    return (
      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-200">
        Pendiente
      </span>
    );
  };

  // Display loading state
  if (loadingApps || loadingTutor) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">
          Cargando datos del sistema...
        </p>
      </div>
    );
  }

  if (isErrorApps || isErrorTutor) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
          <div className="bg-red-50 p-4 rounded-full w-fit mx-auto mb-4 text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Error de Conexión
          </h3>
          <p className="text-slate-500 mb-6 text-sm">
            No se pudieron cargar los datos.
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition w-full"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  const safeApps = Array.isArray(applications) ? applications : [];
  const safeTutors = Array.isArray(tutorRequests) ? tutorRequests : [];

  const filteredApps = safeApps.filter((app) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (app.student_name || '').toLowerCase().includes(search) ||
      (app.opportunity_title || '').toLowerCase().includes(search);
    const matchesType = filterType === 'all' || app.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredTutor = safeTutors.filter((req) =>
    (req.student_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      {/* Page header with search */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Solicitudes</h1>
          <p className="text-slate-500">Gestión de postulantes y documentos.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'applications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
        >
          Postulaciones de Empleo
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'tutor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
        >
          Formalización (Tutores)
        </button>
      </div>

      {/* Applications tab */}
      {activeTab === 'applications' && (
        <>
          <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg w-fit border border-slate-200">
            <Filter size={16} className="text-slate-500" />
            <select
              className="bg-white border border-slate-200 text-sm rounded-md p-1.5 outline-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="pasantia">Pasantías</option>
              <option value="vinculacion">Vinculación</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Estudiante</th>
                  <th className="p-4">Vacante</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No hay postulaciones.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {(app.student_name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {app.student_name}
                            </p>
                            <button
                              onClick={() => handleOpenProfile(app)}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-bold mt-1"
                            >
                              <Eye size={14} /> Ver Perfil
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 text-sm">
                        {app.opportunity_title}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${app.type === 'pasantia' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                        >
                          {app.type}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(app.status)}</td>
                      <td className="p-4 text-right">
                        {app.status === 'Pendiente' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  app.id,
                                  'applications',
                                  'Aprobado'
                                )
                              }
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                              title="Aprobar"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  app.id,
                                  'applications',
                                  'Rechazado'
                                )
                              }
                              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                              title="Rechazar"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tutor formalization tab */}
      {activeTab === 'tutor' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Solicitud</th>
                <th className="p-4">Tutor Asignado</th>
                <th className="p-4">Memo/Aval</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTutor.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No hay solicitudes de tutoría.
                  </td>
                </tr>
              ) : (
                filteredTutor.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 text-sm">
                        {req.student_name}
                      </div>
                      <button
                        onClick={() => handleOpenProfile(req)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Eye size={12} /> Ver Perfil
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <FileText size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <span className="block text-sm font-medium text-slate-700">
                            {req.title}
                          </span>
                          <a
                            href={`${API_URL}/api/uploads/${req.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-bold"
                          >
                            <Download size={12} /> Ver PDF
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {req.assigned_tutor ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                            <UserPlus size={14} />
                            <span className="text-xs font-bold">
                              {req.assigned_tutor}
                            </span>
                          </div>
                          {req.tutor_email && (
                            <div className="flex items-center gap-1.5 text-slate-500 ml-1">
                              <Mail size={12} />
                              <span className="text-[11px] font-medium">
                                {req.tutor_email}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          --
                        </span>
                      )}
                    </td>

                    {/* Memo upload and view */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {req.memo_filename ? (
                          <a
                            href={`${API_URL}/api/uploads/${req.memo_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100"
                          >
                            <CheckCircle size={12} /> Ver Memo
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Pendiente
                          </span>
                        )}

                        {/* Input oculto para subir archivo */}
                        <label
                          className="cursor-pointer p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                          title="Subir Memo/Aval"
                        >
                          <Upload size={16} />
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) => handleFileChange(e, req.id)}
                          />
                        </label>
                      </div>
                    </td>

                    <td className="p-4">{getStatusBadge(req.status)}</td>
                    <td className="p-4 text-right">
                      {req.status === 'Pendiente' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleStatusChange(
                                req.id,
                                'tutor-requests',
                                'Aprobado'
                              )
                            }
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                req.id,
                                'tutor-requests',
                                'Rechazado'
                              )
                            }
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Student profile modal */}
      {viewingStudentId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {basicStudentInfo?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">
                    {basicStudentInfo?.name}
                  </h3>
                  <p className="text-slate-500 flex items-center gap-2 text-sm">
                    <Mail size={14} /> {basicStudentInfo?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseProfile}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 min-h-[300px]">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <Loader className="animate-spin text-blue-600" size={32} />
                  <p>Cargando información detallada...</p>
                </div>
              ) : !fullProfile ? (
                <div className="text-center text-red-500">
                  <p>No se encontraron datos detallados.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        generateStudentCV(fullProfile, basicStudentInfo)
                      }
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-md"
                    >
                      <Download size={16} /> Descargar Hoja de Vida
                    </button>
                  </div>
                  <section>
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Briefcase className="text-purple-600" /> Experiencia
                    </h4>
                    {fullProfile.experiences &&
                    fullProfile.experiences.length > 0 ? (
                      fullProfile.experiences.map((exp, i) => (
                        <div
                          key={i}
                          className="mb-4 pl-4 border-l-2 border-purple-200"
                        >
                          <h5 className="font-bold">{exp.role}</h5>
                          <p className="text-sm text-purple-600">
                            {exp.company}
                          </p>
                          <p className="text-xs text-slate-400">
                            {exp.start_date} - {exp.end_date || 'Actualidad'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic bg-slate-50 p-3 rounded">
                        Sin experiencia registrada.
                      </p>
                    )}
                  </section>
                  <section>
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <GraduationCap className="text-orange-500" /> Educación
                    </h4>
                    {fullProfile.certifications &&
                    fullProfile.certifications.length > 0 ? (
                      fullProfile.certifications.map((cert, i) => (
                        <div
                          key={i}
                          className="mb-2 bg-orange-50 p-3 rounded-lg flex justify-between"
                        >
                          <span className="font-bold text-sm">
                            {cert.title}
                          </span>
                          <span className="text-xs font-bold text-orange-700">
                            {cert.year}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic bg-slate-50 p-3 rounded">
                        Sin educación registrada.
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
