import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Calendar,
  Search,
  Edit,
  Building,
  X,
  PlusCircle,
  Users,
  CheckCircle,
  LayoutDashboard,
  Bell,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Notification from '../components/Notification';
import { Skeleton } from '../components/ui/Skeleton';

// --- COMPONENTES AUXILIARES (UI) ---
const QuickActionCard = ({
  icon: Icon,
  title,
  primary = false,
  onClick,
  disabled = false,
  subtitle,
}) => (
  <button
    onClick={disabled ? null : onClick}
    disabled={disabled}
    className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all w-full text-left active:scale-95 relative overflow-hidden ${
      disabled
        ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed opacity-70'
        : primary
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 cursor-pointer'
          : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50 hover:shadow-sm cursor-pointer'
    }`}
  >
    <Icon
      size={20}
      className={
        disabled
          ? 'text-slate-300'
          : primary
            ? 'text-blue-100'
            : 'text-blue-600'
      }
    />
    <div className="flex flex-col">
      <span>{title}</span>
      {subtitle && (
        <span className="text-[10px] font-normal opacity-80">{subtitle}</span>
      )}
    </div>
  </button>
);

const StatCard = ({ icon: Icon, title, value, colorBg, colorText }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 h-full hover:shadow-md transition-all">
    <div className={`p-4 rounded-xl ${colorBg} ${colorText}`}>
      <Icon size={28} strokeWidth={2} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

const ApplicationCard = ({ title, subtitle, status, date }) => {
  const statusColors = {
    Pendiente: 'bg-yellow-100 text-yellow-700',
    Aprobado: 'bg-emerald-100 text-emerald-700',
    Rechazado: 'bg-rose-100 text-rose-700',
  };
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Building size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            statusColors[status] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {status}
        </span>
        <p className="text-xs text-slate-400 mt-2">{date}</p>
      </div>
    </div>
  );
};

const ModalOverlay = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const StatSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 h-full">
    <Skeleton className="h-16 w-16 rounded-xl" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

// --- DASHBOARD PRINCIPAL ---
const Dashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const COLORS = ['#10B981', '#F59E0B', '#F43F5E'];

  // --- 1. QUERY DE APLICACIONES (POSTULACIONES) ---
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['applications', isAdmin ? 'admin' : 'student'],
    queryFn: async () => {
      const endpoint = isAdmin
        ? 'http://localhost:5001/api/admin/applications'
        : 'http://localhost:5001/api/applications';
      const res = await authFetch(endpoint);
      if (!res.ok) throw new Error('Error fetching applications');
      return res.json();
    },
    staleTime: 1000 * 60, // Cache de 1 min
  });

  // --- 2. QUERY DE CITAS ---
  const { data: myAppointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await authFetch('http://localhost:5001/api/appointments');
      if (!res.ok) throw new Error('Error fetching appointments');
      return res.json();
    },
  });

  // --- 3. QUERY DE VACANTES (Vital para el número de vacantes) ---
  const { data: opportunities = [], isLoading: loadingOpps } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      // Usamos fetch normal para asegurar lectura
      const res = await fetch('http://localhost:5001/api/opportunities');
      if (!res.ok) throw new Error('Error fetching opportunities');
      return res.json();
    },
  });

  // --- 4. QUERY DE PERFIL ---
  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const res = await authFetch(
        `http://localhost:5001/api/profile/${user.id}`
      );
      if (!res.ok) throw new Error('Error fetching profile');
      return res.json();
    },
    enabled: !!user && !isAdmin,
  });

  // --- CÁLCULOS EN TIEMPO REAL (Las Matemáticas) ---

  // Filtros
  const pendingApps = applications.filter((app) => app.status === 'Pendiente');
  const approvedApps = applications.filter((app) => app.status === 'Aprobado');
  const rejectedApps = applications.filter((app) => app.status === 'Rechazado');

  // Notificaciones
  const notifications = isAdmin
    ? pendingApps
    : applications.filter((app) => app.status !== 'Pendiente');

  // Datos para la lista visual (Admin ve ultimas 5, Student ve todas)
  const listData = isAdmin
    ? [...applications].reverse().slice(0, 5)
    : applications;

  // Datos para la gráfica de pastel
  const adminStats = [
    { name: 'Aprobados', value: approvedApps.length },
    { name: 'Pendientes', value: pendingApps.length },
    { name: 'Rechazados', value: rejectedApps.length },
  ];

  // Score del estudiante
  let studentScore = 20;
  if (applications.length > 0) studentScore += 40;
  if (profileData?.certifications?.length > 0) studentScore += 40;

  // Estado general de carga
  const isLoading = loadingApps || loadingAppts || loadingOpps;

  // --- ESTADOS UI ---
  const [showCVModal, setShowCVModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [creatingOpp, setCreatingOpp] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [oppData, setOppData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    deadline: '',
    vacancies: 1,
  });

  const [visualNotification, setVisualNotification] = useState({
    message: null,
    type: null,
  });
  const [appointmentData, setAppointmentData] = useState({
    appId: '',
    date: '',
    time: '',
  });

  // --- HANDLERS ---
  const handleCVSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const file = document.getElementById('cv-upload').files[0];
    if (!file) {
      setVisualNotification({ message: 'Selecciona un PDF', type: 'error' });
      setUploading(false);
      return;
    }
    let token = localStorage.getItem('token').replace(/^"|"$/g, '').trim();
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5001/api/upload-cv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setVisualNotification({ message: '✅ CV Subido', type: 'success' });
        setShowCVModal(false);
      } else {
        setVisualNotification({ message: '❌ Error', type: 'error' });
      }
    } catch {
      setVisualNotification({ message: '❌ Error conexión', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentData.appId) return;
    setScheduling(true);
    try {
      const res = await authFetch('http://localhost:5001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: appointmentData.appId,
          date: appointmentData.date,
          time: appointmentData.time,
        }),
      });
      if (res.ok) {
        setShowCalendarModal(false);
        setVisualNotification({ message: '✅ Cita Agendada', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    } catch (e) {
    } finally {
      setScheduling(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    setCreatingOpp(true);
    try {
      const res = await fetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppData),
      });
      if (res.ok) {
        setVisualNotification({
          message: '✅ Oferta publicada',
          type: 'success',
        });
        setOppData({
          title: '',
          company: '',
          description: '',
          location: '',
          deadline: '',
          vacancies: 1,
        });
        setShowOppModal(false);
        // ACTUALIZAR CONTADOR AL INSTANTE
        queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      }
    } catch (e) {
    } finally {
      setCreatingOpp(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 relative min-h-screen">
      <Notification
        message={visualNotification.message}
        type={visualNotification.type}
        onClose={() => setVisualNotification({ message: null, type: null })}
      />

      {/* MODALES */}
      {showCVModal && (
        <ModalOverlay title="Subir CV" onClose={() => setShowCVModal(false)}>
          <form onSubmit={handleCVSubmit} className="space-y-6">
            <input
              type="file"
              id="cv-upload"
              accept=".pdf"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
            >
              {uploading ? 'Subiendo...' : 'Guardar CV'}
            </button>
          </form>
        </ModalOverlay>
      )}
      {showCalendarModal && (
        <ModalOverlay
          title="Agendar Entrevista"
          onClose={() => setShowCalendarModal(false)}
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <p>Selecciona una postulación APROBADA.</p>
            </div>
            <select
              className="w-full p-3 bg-slate-50 border rounded-xl"
              onChange={(e) =>
                setAppointmentData({
                  ...appointmentData,
                  appId: e.target.value,
                })
              }
              required
            >
              <option value="">-- Selecciona Postulación --</option>
              {approvedApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.opportunity_title}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="w-full p-3 bg-slate-50 border rounded-xl"
                onChange={(e) =>
                  setAppointmentData({
                    ...appointmentData,
                    date: e.target.value,
                  })
                }
                required
              />
              <input
                type="time"
                className="w-full p-3 bg-slate-50 border rounded-xl"
                onChange={(e) =>
                  setAppointmentData({
                    ...appointmentData,
                    time: e.target.value,
                  })
                }
                required
              />
            </div>
            <button
              type="submit"
              disabled={scheduling}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl"
            >
              {scheduling ? '...' : 'Confirmar'}
            </button>
          </form>
        </ModalOverlay>
      )}

      {showOppModal && (
        <ModalOverlay
          title="Nueva Vacante"
          onClose={() => setShowOppModal(false)}
        >
          <form onSubmit={handleCreateOpportunity} className="space-y-4">
            <input
              type="text"
              placeholder="Cargo"
              value={oppData.title}
              onChange={(e) =>
                setOppData({ ...oppData, title: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
              required
            />
            <input
              type="text"
              placeholder="Empresa"
              value={oppData.company}
              onChange={(e) =>
                setOppData({ ...oppData, company: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={oppData.deadline}
                  onChange={(e) =>
                    setOppData({ ...oppData, deadline: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl text-slate-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Vacantes
                </label>
                <input
                  type="number"
                  min="1"
                  value={oppData.vacancies}
                  onChange={(e) =>
                    setOppData({ ...oppData, vacancies: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl"
                  required
                />
              </div>
            </div>
            <textarea
              placeholder="Descripción"
              value={oppData.description}
              onChange={(e) =>
                setOppData({ ...oppData, description: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
              required
            ></textarea>
            <button
              type="submit"
              disabled={creatingOpp}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
            >
              {creatingOpp ? '...' : 'Publicar'}
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative z-40">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Hola, {user?.name}{' '}
            {isAdmin && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase">
                Admin
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Panel de control.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4">
              <h4 className="font-bold mb-2">Notificaciones</h4>
              {notifications.length === 0 && (
                <p className="text-xs text-gray-400">Sin notificaciones</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="text-sm py-2 border-b">
                  {n.opportunity_title} ({n.status})
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* STATS CON SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : isAdmin ? (
          <>
            <StatCard
              icon={Briefcase}
              title="Vacantes"
              // CORRECCIÓN 1: Cuenta real de vacantes desde DB
              value={opportunities.length || '0'}
              colorBg="bg-blue-50"
              colorText="text-blue-600"
            />
            <StatCard
              icon={Users}
              title="Postulantes"
              // CORRECCIÓN 2: Cuenta real de todos los estudiantes postulados
              value={applications.length || '0'}
              colorBg="bg-green-50"
              colorText="text-green-600"
            />
            <StatCard
              icon={CheckCircle}
              title="Contratados"
              // CORRECCIÓN 3: Cuenta real de Aprobados
              value={approvedApps.length || '0'}
              colorBg="bg-purple-50"
              colorText="text-purple-600"
            />
            <div
              onClick={() => navigate('/admin/postulaciones')}
              className="cursor-pointer hover:scale-105"
            >
              <StatCard
                icon={LayoutDashboard}
                title="Reportes"
                value="Ver"
                colorBg="bg-orange-50"
                colorText="text-orange-600"
              />
            </div>
          </>
        ) : (
          <>
            <StatCard
              icon={Briefcase}
              title="Postulaciones"
              value={applications.length}
              colorBg="bg-blue-50"
              colorText="text-blue-600"
            />

            <StatCard
              icon={Clock}
              title="Entrevistas"
              value={myAppointments.length}
              colorBg="bg-purple-50"
              colorText="text-purple-600"
            />
            <StatCard
              icon={CheckCircle}
              title="Aprobadas"
              value={approvedApps.length}
              colorBg="bg-orange-50"
              colorText="text-orange-600"
            />
          </>
        )}
      </div>

      {/* GRÁFICAS CON SKELETON */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <Skeleton className="col-span-3 h-64 w-full rounded-2xl" />
        ) : isAdmin ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-3 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Tasa de Aprobación
              </h3>
              <div className="mt-4 space-y-2">
                {adminStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-sm font-medium text-slate-600">
                      {stat.name}: <b>{stat.value}</b>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-64 h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={adminStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {adminStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg col-span-3 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="z-10 max-w-lg">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                <Award className="text-yellow-400" /> Nivel de Perfil
              </h3>
              <p className="text-slate-300 mb-4">
                Completa cursos para llegar al 100%.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`p-1 rounded-full ${
                      studentScore >= 20 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className={
                      studentScore >= 20 ? 'text-white' : 'text-slate-500'
                    }
                  >
                    Registro completado (20%)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`p-1 rounded-full ${
                      studentScore >= 60 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className={
                      studentScore >= 60 ? 'text-white' : 'text-slate-500'
                    }
                  >
                    Postulación enviada (40%)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`p-1 rounded-full ${
                      studentScore >= 100 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className={
                      studentScore >= 100 ? 'text-white' : 'text-slate-500'
                    }
                  >
                    Formación Académica (40%)
                  </span>
                </div>
              </div>
            </div>
            <div className="z-10 w-48 h-48 relative flex items-center justify-center mt-6 md:mt-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { value: studentScore },
                      { value: 100 - studentScore },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#334155" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black">{studentScore}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACCIONES Y LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isAdmin ? (
                <>
                  <QuickActionCard
                    icon={PlusCircle}
                    title="Publicar Vacante"
                    primary
                    onClick={() => setShowOppModal(true)}
                  />
                  <QuickActionCard
                    icon={Users}
                    title="Ver Postulaciones"
                    // CORRECCIÓN 4: Navegación correcta a la pantalla de Excel
                    onClick={() => navigate('/admin/postulaciones')}
                  />
                </>
              ) : (
                <>
                  <QuickActionCard
                    icon={Search}
                    title="Buscar Empleo"
                    primary
                    onClick={() => navigate('/oportunidades')}
                  />

                  <QuickActionCard
                    icon={Calendar}
                    title="Agendar Entrevista"
                    subtitle={
                      approvedApps.length > 0
                        ? '¡Tienes aprobaciones!'
                        : 'Requiere aprobación'
                    }
                    onClick={() => setShowCalendarModal(true)}
                    disabled={approvedApps.length === 0}
                  />
                  <QuickActionCard
                    icon={Edit}
                    title="Editar Perfil"
                    onClick={() => navigate('/perfil')}
                  />
                </>
              )}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </>
              ) : listData.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-400 font-medium">Sin actividad.</p>
                </div>
              ) : (
                listData.map((item) => (
                  <ApplicationCard
                    key={item.id}
                    title={item.opportunity_title}
                    subtitle={
                      isAdmin
                        ? `Estudiante: ${item.student_name}`
                        : 'Tu postulación'
                    }
                    status={item.status}
                    date={item.date}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
