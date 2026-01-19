import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Calendar,
  User,
  Search,
  Upload,
  Edit,
  Building,
  X,
  PlusCircle,
  Users,
  CheckCircle,
  LayoutDashboard,
  Bell,
  Clock,
  Loader,
  MapPin,
  TrendingUp,
  Award,
} from 'lucide-react';
// --- LIBRERÍA DE GRÁFICAS ---
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Notification from '../components/Notification';

// --- COMPONENTES AUXILIARES ---
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
    className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all w-full text-left active:scale-95 relative overflow-hidden
        ${
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
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[status] || 'bg-slate-100 text-slate-700'}`}
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

// --- DASHBOARD PRINCIPAL ---
const Dashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [listData, setListData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [approvedApps, setApprovedApps] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);

  // Estados de Modales
  const [showCVModal, setShowCVModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [creatingOpp, setCreatingOpp] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Estados de Gráficas
  const [adminStats, setAdminStats] = useState([]);
  const [studentScore, setStudentScore] = useState(0);

  const [oppData, setOppData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    deadline: '',
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

  const COLORS = ['#10B981', '#F59E0B', '#F43F5E']; // Verde, Amarillo, Rojo

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- AQUÍ ESTÁ EL ARREGLO CLAVE ---
        // Si es admin usa la ruta global, si es estudiante la ruta personal
        const endpoint = isAdmin
          ? 'http://localhost:5001/api/admin/applications'
          : 'http://localhost:5001/api/applications';

        const resApps = await authFetch(endpoint);

        if (resApps.ok) {
          const data = await resApps.json();

          if (isAdmin) {
            // --- ADMIN: Calcular Dona ---
            const pending = data.filter((app) => app.status === 'Pendiente');
            const approved = data.filter((app) => app.status === 'Aprobado');
            const rejected = data.filter((app) => app.status === 'Rechazado');

            setNotifications(pending);
            setListData(data.reverse().slice(0, 5));

            // Datos para Recharts
            setAdminStats([
              { name: 'Aprobados', value: approved.length },
              { name: 'Pendientes', value: pending.length },
              { name: 'Rechazados', value: rejected.length },
            ]);
          } else {
            // --- ESTUDIANTE: Calcular Nivel ---
            // Si el backend devuelve todas (filtrado por token), usamos data directamente
            const myApps = data;

            setListData(myApps);
            setNotifications(
              myApps.filter((app) => app.status !== 'Pendiente')
            );
            setApprovedApps(myApps.filter((app) => app.status === 'Aprobado'));

            // Gamificación
            let score = 20;
            if (myApps.length > 0) score += 40;
            if (user.certifications && user.certifications.length > 0)
              score += 40;

            setStudentScore(score);
          }
        }

        // Cargar Citas
        const resCitas = await authFetch(
          'http://localhost:5001/api/appointments'
        );
        if (resCitas.ok) {
          const citas = await resCitas.json();
          setMyAppointments(citas);
        }
      } catch (error) {
        console.error('Error cargando datos', error);
      }
    };
    fetchData();
  }, [user, isAdmin, authFetch]);

  // --- HANDLERS ---
  const handleCVSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const file = document.getElementById('cv-upload').files[0];
    if (!file) {
      setVisualNotification({
        message: 'Selecciona un PDF primero',
        type: 'error',
      });
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
        setVisualNotification({
          message: '✅ CV Subido con éxito',
          type: 'success',
        });
        setShowCVModal(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setVisualNotification({
          message: '❌ Error al subir CV',
          type: 'error',
        });
      }
    } catch {
      setVisualNotification({ message: '❌ Error de conexión', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (
      !appointmentData.appId ||
      !appointmentData.date ||
      !appointmentData.time
    ) {
      setVisualNotification({ message: '⚠️ Faltan datos', type: 'error' });
      return;
    }
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
      const data = await res.json();
      if (res.ok) {
        setShowCalendarModal(false);
        setVisualNotification({
          message: '✅ ¡Cita Agendada!',
          type: 'success',
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setVisualNotification({
          message: `❌ Error: ${data.error}`,
          type: 'error',
        });
      }
    } catch (error) {
      setVisualNotification({ message: '❌ Error de conexión', type: 'error' });
    } finally {
      setScheduling(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!oppData.title || !oppData.company || !oppData.description) {
      setVisualNotification({
        message: '⚠️ Completa los campos obligatorios',
        type: 'error',
      });
      return;
    }
    setCreatingOpp(true);
    try {
      const res = await fetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppData),
      });
      if (res.ok) {
        setVisualNotification({
          message: '✅ Oferta publicada correctamente',
          type: 'success',
        });
        setOppData({
          title: '',
          company: '',
          description: '',
          location: '',
          deadline: '',
        });
        setShowOppModal(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setVisualNotification({
          message: '❌ Error al publicar',
          type: 'error',
        });
      }
    } catch (error) {
      setVisualNotification({ message: '❌ Error de conexión', type: 'error' });
    } finally {
      setCreatingOpp(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto p-8 relative min-h-screen">
      <Notification
        message={visualNotification.message}
        type={visualNotification.type}
        onClose={() => setVisualNotification({ message: null, type: null })}
      />

      {/* --- MODAL CV --- */}
      {showCVModal && (
        <ModalOverlay
          title="Subir Hoja de Vida"
          onClose={() => setShowCVModal(false)}
        >
          <form onSubmit={handleCVSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-8 text-center">
              <Upload className="mx-auto text-blue-500 mb-2" size={40} />
              <p className="font-bold text-slate-700">Sube tu PDF aquí</p>
              <input
                type="file"
                id="cv-upload"
                accept=".pdf"
                className="hidden"
              />
              <label
                htmlFor="cv-upload"
                className="block mt-4 text-blue-600 font-bold underline cursor-pointer"
              >
                Seleccionar Archivo
              </label>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-400"
            >
              {uploading ? 'Subiendo...' : 'Guardar CV'}
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* --- MODAL CITA --- */}
      {showCalendarModal && (
        <ModalOverlay
          title="📅 Agendar Entrevista"
          onClose={() => setShowCalendarModal(false)}
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4">
              <p>Selecciona la postulación aprobada y tu horario preferido.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Postulación
              </label>
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
                <option value="">-- Selecciona --</option>
                {approvedApps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.opportunity_title} (Aprobado)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Fecha
                </label>
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
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Hora
                </label>
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
            </div>
            <button
              type="submit"
              disabled={scheduling}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-slate-400"
            >
              {scheduling ? 'Enviando...' : 'Confirmar Cita'}
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* --- MODAL OPORTUNIDAD --- */}
      {showOppModal && (
        <ModalOverlay
          title="📢 Publicar Nueva Vacante"
          onClose={() => setShowOppModal(false)}
        >
          <form onSubmit={handleCreateOpportunity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Cargo / Título
              </label>
              <input
                type="text"
                placeholder="Ej: Desarrollador Java"
                value={oppData.title}
                onChange={(e) =>
                  setOppData({ ...oppData, title: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Empresa
                </label>
                <div className="relative">
                  <Building
                    size={16}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Empresa S.A."
                    value={oppData.company}
                    onChange={(e) =>
                      setOppData({ ...oppData, company: e.target.value })
                    }
                    className="w-full pl-9 p-3 bg-slate-50 border rounded-xl outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Quito"
                    value={oppData.location}
                    onChange={(e) =>
                      setOppData({ ...oppData, location: e.target.value })
                    }
                    className="w-full pl-9 p-3 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-orange-600">
                Fecha de Cierre (Opcional)
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type="date"
                  min={today}
                  value={oppData.deadline}
                  onChange={(e) =>
                    setOppData({ ...oppData, deadline: e.target.value })
                  }
                  className="w-full pl-9 p-3 bg-orange-50 border border-orange-200 rounded-xl outline-none focus:border-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Descripción
              </label>
              <textarea
                rows="4"
                placeholder="Requisitos y detalles..."
                value={oppData.description}
                onChange={(e) =>
                  setOppData({ ...oppData, description: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={creatingOpp}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-slate-400"
            >
              {creatingOpp ? (
                <Loader className="animate-spin mx-auto" />
              ) : (
                'Publicar Ahora'
              )}
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
            Panel de control académico.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-50 bg-slate-50">
                  <span className="font-bold text-slate-700 text-sm">
                    Notificaciones ({notifications.length})
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 border-b border-slate-50 text-sm"
                    >
                      {n.opportunity_title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
            <User size={20} />
          </div>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin ? (
          <>
            <StatCard
              icon={Briefcase}
              title="Vacantes"
              value="12"
              colorBg="bg-blue-50"
              colorText="text-blue-600"
            />
            <StatCard
              icon={Users}
              title="Postulantes"
              value={
                listData.reduce((acc, curr) => acc + (isAdmin ? 1 : 0), 0) ||
                '0'
              }
              colorBg="bg-green-50"
              colorText="text-green-600"
            />
            <StatCard
              icon={CheckCircle}
              title="Contratados"
              value="5"
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
              title="Mis Postulaciones"
              value={listData.length}
              colorBg="bg-blue-50"
              colorText="text-blue-600"
            />
            <StatCard
              icon={FileText}
              title="CV Cargado"
              value="Si"
              colorBg="bg-green-50"
              colorText="text-green-600"
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

      {/* --- GRÁFICAS INTERACTIVAS --- */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAdmin ? (
          // GRÁFICO ADMIN: DONA DE APROBACIÓN
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-3 lg:col-span-3 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Tasa de Aprobación
              </h3>
              <p className="text-slate-500 text-sm">
                Distribución de estados de las postulaciones actuales.
              </p>

              <div className="mt-4 space-y-2">
                {adminStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-sm font-medium text-slate-600">
                      {stat.name}:{' '}
                      <span className="font-bold text-slate-900">
                        {stat.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-64 h-64">
              {adminStats.reduce((a, b) => a + b.value, 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
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
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                  Sin datos aún
                </div>
              )}
            </div>
          </div>
        ) : (
          // GRÁFICO ESTUDIANTE: NIVEL DE PERFIL
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg col-span-3 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

            <div className="z-10 max-w-lg">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                <Award className="text-yellow-400" /> Nivel de Perfil
              </h3>
              <p className="text-slate-300 mb-4">
                Completa tu perfil para destacar ante las empresas. ¡Sigue así!
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`p-1 rounded-full ${studentScore >= 20 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className={
                      studentScore >= 20 ? 'text-white' : 'text-slate-500'
                    }
                  >
                    Registro completado
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`p-1 rounded-full ${studentScore >= 60 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className={
                      studentScore >= 60 ? 'text-white' : 'text-slate-500'
                    }
                  >
                    Primera postulación enviada
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`p-1 rounded-full ${studentScore >= 100 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className={
                      studentScore >= 100 ? 'text-white' : 'text-slate-500'
                    }
                  >
                    Perfil Profesional (Cursos añadidos)
                  </span>
                </div>
              </div>
            </div>

            <div className="z-10 w-48 h-48 relative flex items-center justify-center mt-6 md:mt-0">
              <ResponsiveContainer width="100%" height="100%">
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
                <span className="text-xs uppercase tracking-widest text-slate-400">
                  Completado
                </span>
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
                    onClick={() => navigate('/admin/postulaciones')}
                  />
                  <QuickActionCard
                    icon={Search}
                    title="Ver Ofertas"
                    onClick={() => navigate('/oportunidades')}
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
                    icon={Upload}
                    title="Subir CV"
                    onClick={() => setShowCVModal(true)}
                  />
                  <QuickActionCard
                    icon={Calendar}
                    title="Agendar Entrevista"
                    subtitle={
                      approvedApps.length > 0
                        ? '¡Tienes aprobaciones pendientes!'
                        : 'Requiere postulación aprobada'
                    }
                    onClick={() => setShowCalendarModal(true)}
                    disabled={approvedApps.length === 0}
                  />
                </>
              )}
              <QuickActionCard
                icon={Edit}
                title="Editar Perfil"
                onClick={() => navigate('/perfil')}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {isAdmin ? 'Últimas Postulaciones' : 'Actividad Reciente'}
            </h2>
            <div className="space-y-4">
              {listData.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-400 font-medium">
                    No hay actividad reciente.
                  </p>
                </div>
              ) : (
                listData.map((item) => (
                  <ApplicationCard
                    key={item.id}
                    title={item.opportunity_title}
                    subtitle={
                      isAdmin
                        ? `ID Estudiante: ${item.student_id}`
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
