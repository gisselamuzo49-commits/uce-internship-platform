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
} from 'lucide-react';
import Notification from '../components/Notification';

// --- COMPONENTES AUXILIARES (Sin cambios) ---
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
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 h-full">
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
    Aprobado: 'bg-green-100 text-green-700',
    Rechazado: 'bg-red-100 text-red-700',
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
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6">{children}</div>
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
  const [approvedApps, setApprovedApps] = useState([]); // Postulaciones aprobadas
  const [myAppointments, setMyAppointments] = useState([]); // Citas ya agendadas

  const [showCVModal, setShowCVModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [visualNotification, setVisualNotification] = useState({
    message: null,
    type: null,
  });

  // Estado para agendar cita
  const [appointmentData, setAppointmentData] = useState({
    appId: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar Postulaciones
        const resApps = await authFetch(
          'http://localhost:5001/api/applications'
        );
        if (resApps.ok) {
          const data = await resApps.json();
          if (isAdmin) {
            const pending = data.filter((app) => app.status === 'Pendiente');
            setNotifications(pending);
            setListData(data.reverse().slice(0, 5));
          } else {
            const myApps = data.filter(
              (app) => String(app.student_id) === String(user.id)
            );
            setListData(myApps);
            setNotifications(
              myApps.filter((app) => app.status !== 'Pendiente')
            );
            // Filtramos las aprobadas para el select de citas
            setApprovedApps(myApps.filter((app) => app.status === 'Aprobado'));
          }
        }

        // 2. Cargar Citas existentes
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

  // Manejo de CV (Igual que antes)
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
        setVisualNotification({
          message: 'CV Subido con éxito',
          type: 'success',
        });
        setShowCVModal(false);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setVisualNotification({ message: 'Error al subir', type: 'error' });
      }
    } catch {
      setVisualNotification({ message: 'Error de conexión', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // --- NUEVO: Manejo de Agendar Cita ---
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (
      !appointmentData.appId ||
      !appointmentData.date ||
      !appointmentData.time
    ) {
      setVisualNotification({
        message: 'Completa todos los campos',
        type: 'error',
      });
      return;
    }
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
        setVisualNotification({
          message: '¡Entrevista agendada!',
          type: 'success',
        });
        setShowCalendarModal(false);
        setMyAppointments([...myAppointments, data]); // Actualizar contador visualmente
      } else {
        setVisualNotification({
          message: data.error || 'Error al agendar',
          type: 'error',
        });
      }
    } catch (error) {
      setVisualNotification({ message: 'Error de conexión', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 relative min-h-screen">
      <Notification
        message={visualNotification.message}
        type={visualNotification.type}
        onClose={() => setVisualNotification({ message: null, type: null })}
      />

      {/* MODAL CV */}
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
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700"
            >
              {uploading ? 'Subiendo...' : 'Guardar CV'}
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* --- NUEVO MODAL: AGENDAR CITA --- */}
      {showCalendarModal && (
        <ModalOverlay
          title="📅 Agendar Entrevista"
          onClose={() => setShowCalendarModal(false)}
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4">
              <p>
                ¡Felicidades! Has pasado a la siguiente etapa. Selecciona la
                postulación y tu horario preferido.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Selecciona Postulación Aprobada
              </label>
              <select
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition"
            >
              Confirmar Cita
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
                <div className="p-3 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-sm">
                    Notificaciones ({notifications.length})
                  </span>
                  <button onClick={() => setShowNotifDropdown(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      Sin novedades.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b border-slate-50 hover:bg-slate-50 flex gap-3 items-start"
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${notif.status === 'Pendiente' ? 'bg-yellow-400' : 'bg-green-500'}`}
                        ></div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {notif.opportunity_title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isAdmin
                              ? `ID: ${notif.student_id}`
                              : `Estado: ${notif.status}`}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
            <User size={20} />
          </div>
        </div>
      </header>

      {/* STATS */}
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
              value={listData.length}
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
            {/* AQUÍ ACTUALIZAMOS EL CONTADOR DE CITAS */}
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
                    onClick={() => navigate('/admin/nueva-oportunidad')}
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

                  {/* --- BOTÓN INTELIGENTE: AGENDAR CITA --- */}
                  <QuickActionCard
                    icon={Calendar}
                    title="Agendar Entrevista"
                    subtitle={
                      approvedApps.length > 0
                        ? '¡Tienes aprobaciones pendientes!'
                        : 'Requiere postulación aprobada'
                    }
                    onClick={() => setShowCalendarModal(true)}
                    disabled={approvedApps.length === 0} // SOLO SE ACTIVA SI HAY APROBADAS
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
