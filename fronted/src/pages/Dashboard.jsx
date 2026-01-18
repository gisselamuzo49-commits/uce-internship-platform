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
} from 'lucide-react';
// 1. IMPORTAR NOTIFICACIÓN
import Notification from '../components/Notification';

// ... (Componentes QuickActionCard, StatCard, ApplicationCard, ModalOverlay siguen igual)
const QuickActionCard = ({ icon: Icon, title, primary = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all w-full text-left cursor-pointer active:scale-95 ${primary ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50 hover:shadow-sm'}`}
  >
    <Icon size={20} className={primary ? 'text-blue-100' : 'text-blue-600'} />
    <span>{title}</span>
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

const Dashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [listData, setListData] = useState([]);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // 2. ESTADO PARA LA NOTIFICACIÓN VISUAL
  const [visualNotification, setVisualNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch('http://localhost:5001/api/applications');
        if (res.ok) {
          const data = await res.json();
          if (isAdmin) {
            const pending = data.filter((app) => app.status === 'Pendiente');
            setNotifications(pending);
            setListData(data.reverse().slice(0, 5));
          } else {
            const myApps = data.filter(
              (app) => String(app.student_id) === String(user.id)
            );
            const updates = myApps.filter((app) => app.status !== 'Pendiente');
            setNotifications(updates);
            setListData(myApps);
          }
        }
      } catch (error) {
        console.error('Error cargando datos', error);
      }
    };
    fetchData();
  }, [user, isAdmin, authFetch]); // Agregué authFetch a las dependencias

  const handleCVSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const file = document.getElementById('cv-upload').files[0];
    if (!file) {
      setVisualNotification({
        message: 'Por favor, selecciona un archivo PDF.',
        type: 'error',
      });
      setUploading(false);
      return;
    }

    let token = localStorage.getItem('token');
    if (token) token = token.replace(/^"|"$/g, '').trim();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5001/api/upload-cv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        // 3. ÉXITO AL SUBIR CV
        setVisualNotification({
          message: '¡Tu Hoja de Vida se ha subido correctamente!',
          type: 'success',
        });
        setShowCVModal(false);
        // Recargar después de un momento para que se vea la notificación
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const data = await res.json();
        setVisualNotification({
          message: data.error || 'Error al subir el archivo.',
          type: 'error',
        });
      }
    } catch (error) {
      setVisualNotification({
        message: 'Error de conexión al intentar subir el archivo.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 relative min-h-screen">
      {/* 4. RENDERIZAR NOTIFICACIÓN */}
      <Notification
        message={visualNotification.message}
        type={visualNotification.type}
        onClose={() => setVisualNotification({ message: null, type: null })}
      />

      {/* MODALES */}
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
              className={`w-full text-white font-bold py-3 rounded-xl ${uploading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {uploading ? 'Subiendo...' : 'Guardar CV'}
            </button>
          </form>
        </ModalOverlay>
      )}
      {showCalendarModal && (
        <ModalOverlay
          title="📅 Agendar Cita"
          onClose={() => setShowCalendarModal(false)}
        >
          <form className="space-y-4">
            <input
              type="date"
              className="w-full p-3 bg-slate-50 border rounded-xl"
            />
            <input
              type="time"
              className="w-full p-3 bg-slate-50 border rounded-xl"
            />
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">
              Confirmar
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* HEADER MEJORADO CON NOTIFICACIONES */}
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
          {/* CAMPANA DE NOTIFICACIONES */}
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

            {/* DROPDOWN DE NOTIFICACIONES */}
            {showNotifDropdown && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="p-3 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-sm">
                    Notificaciones ({notifications.length})
                  </span>
                  <button onClick={() => setShowNotifDropdown(false)}>
                    <X
                      size={16}
                      className="text-slate-400 hover:text-slate-600"
                    />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      No tienes novedades pendientes.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() =>
                          isAdmin ? navigate('/admin/postulaciones') : null
                        }
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${notif.status === 'Pendiente' ? 'bg-yellow-400' : notif.status === 'Aprobado' ? 'bg-green-500' : 'bg-red-500'}`}
                        ></div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 line-clamp-1">
                            {notif.opportunity_title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {isAdmin
                              ? `Nuevo postulante (ID: ${notif.student_id})`
                              : `Estado actualizado: ${notif.status}`}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar size={10} /> {notif.date}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {isAdmin && notifications.length > 0 && (
                  <button
                    onClick={() => navigate('/admin/postulaciones')}
                    className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    Ver todas las postulaciones
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ÍCONO DE USUARIO */}
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
              className="cursor-pointer transition-transform hover:scale-105 h-full"
            >
              <StatCard
                icon={LayoutDashboard}
                title="Reportes"
                value="Ver Detalle"
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
              icon={Calendar}
              title="Citas"
              value="0"
              colorBg="bg-purple-50"
              colorText="text-purple-600"
            />
            <StatCard
              icon={CheckCircle}
              title="Estado"
              value="Activo"
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
                  <QuickActionCard
                    icon={Calendar}
                    title="Agendar Cita"
                    onClick={() => setShowCalendarModal(true)}
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
