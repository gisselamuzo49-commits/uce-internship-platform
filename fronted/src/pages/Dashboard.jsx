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
  Clock,
  CheckCircle,
  PlusCircle,
  Users,
  LayoutDashboard,
} from 'lucide-react';

// --- 1. COMPONENTES UI ---

const QuickActionCard = ({ icon: Icon, title, primary = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all w-full text-left cursor-pointer active:scale-95 ${
      primary
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
        : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50 hover:shadow-sm'
    }`}
  >
    <Icon size={20} className={primary ? 'text-blue-100' : 'text-blue-600'} />
    <span>{title}</span>
  </button>
);

const StatCard = ({ icon: Icon, title, value, colorBg, colorText }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
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

const ApplicationCard = ({ title, subtitle, status, date, id }) => {
  const statusColors = {
    Pendiente: 'bg-yellow-100 text-yellow-700',
    Aceptado: 'bg-green-100 text-green-700',
    Rechazado: 'bg-red-100 text-red-700',
  };
  const statusColor = statusColors[status] || 'bg-slate-100 text-slate-700';

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
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}
        >
          {status}
        </span>
        <p className="text-xs text-slate-400 mt-2">{date}</p>
      </div>
    </div>
  );
};

// --- 2. MODALES ---
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

// --- 3. DASHBOARD PRINCIPAL ---
const Dashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [listData, setListData] = useState([]);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Detectar Rol
  const isAdmin = user?.role === 'admin';

  // Cargar datos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch('http://localhost:5001/api/applications');
        if (res.ok) {
          const data = await res.json();
          if (isAdmin) {
            // Si es Admin, ve TODAS las postulaciones recientes
            setListData(data.reverse().slice(0, 5));
          } else {
            // Si es Estudiante, solo ve las SUYAS
            const misPostulaciones = data.filter(
              (app) => String(app.student_id) === String(user.id)
            );
            setListData(misPostulaciones);
          }
        }
      } catch (error) {
        console.error('Error cargando datos');
      }
    };
    fetchData();
  }, [user, isAdmin]);

  // Manejo de Formularios (Solo Estudiantes)
  const handleCVSubmit = (e) => {
    e.preventDefault();
    alert('¡CV subido!');
    setShowCVModal(false);
  };
  const handleCalendarSubmit = (e) => {
    e.preventDefault();
    alert('¡Cita agendada!');
    setShowCalendarModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 relative min-h-screen">
      {/* MODALES (Solo se muestran si los activas) */}
      {showCVModal && (
        <ModalOverlay
          title="Subir Hoja de Vida"
          onClose={() => setShowCVModal(false)}
        >
          <form onSubmit={handleCVSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-8 text-center">
              <Upload className="mx-auto text-blue-500 mb-2" size={40} />
              <p className="font-bold text-slate-700">Sube tu PDF aquí</p>
              <button className="mt-4 text-blue-600 font-bold underline">
                Seleccionar
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
            >
              Guardar
            </button>
          </form>
        </ModalOverlay>
      )}

      {showCalendarModal && (
        <ModalOverlay
          title="📅 Agendar Cita"
          onClose={() => setShowCalendarModal(false)}
        >
          <form onSubmit={handleCalendarSubmit} className="space-y-4">
            <input
              type="date"
              required
              className="w-full p-3 bg-slate-50 border rounded-xl"
            />
            <input
              type="time"
              required
              className="w-full p-3 bg-slate-50 border rounded-xl"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl"
            >
              Confirmar
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Hola, {user?.name}
            {isAdmin && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase">
                Administrador
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isAdmin
              ? 'Gestiona las vacantes y postulantes desde aquí.'
              : 'Panel de control académico.'}
          </p>
        </div>
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">
          <User size={20} />
        </div>
      </header>

      {/* STATS (Diferentes según rol) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin ? (
          <>
            <StatCard
              icon={Briefcase}
              title="Vacantes Activas"
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
            <StatCard
              icon={LayoutDashboard}
              title="Reportes"
              value="Ver"
              colorBg="bg-orange-50"
              colorText="text-orange-600"
            />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-2 space-y-8">
          {/* ACCIONES RÁPIDAS (DINÁMICAS) */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* --- SI ERES ADMIN --- */}
              {isAdmin ? (
                <>
                  <QuickActionCard
                    icon={PlusCircle}
                    title="Publicar Nueva Vacante"
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
                    title="Ver Ofertas Publicadas"
                    onClick={() => navigate('/oportunidades')}
                  />
                </>
              ) : (
                /* --- SI ERES ESTUDIANTE --- */
                <>
                  <QuickActionCard
                    icon={Search}
                    title="Buscar Oportunidades"
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

          {/* LISTA DE DATOS */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {isAdmin
                ? 'Últimas Postulaciones Recibidas'
                : 'Mis Postulaciones Recientes'}
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
                    id={item.id}
                    title={item.opportunity_title}
                    subtitle={
                      isAdmin
                        ? `Estudiante ID: ${item.student_id}`
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

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Avisos Importantes
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <h4 className="font-bold text-sm text-slate-800">
                  Feria Laboral UCE
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Viernes 20, Explanada Central.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
