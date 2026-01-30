import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Calendar,
  Search,
  Edit,
  Award,
  CheckCircle,
  Clock,
  Bell,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Notification from '../../components/Notification';
// Asegúrate de que esta ruta sea correcta según donde guardaste DashboardUI
import {
  QuickActionCard,
  StatCard,
  ApplicationCard,
  ModalOverlay,
  StatSkeleton,
} from '../panel_control/components/DashboardUI';

const StudentDashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- ESTADOS ---
  const [showCVModal, setShowCVModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [visualNotification, setVisualNotification] = useState({
    message: null,
    type: null,
  });
  const [appointmentData, setAppointmentData] = useState({
    appId: '',
    date: '',
    time: '',
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // --- QUERIES ---

  // 1. Postulaciones (URL CORREGIDA)
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['applications', 'student'],
    queryFn: async () => {
      // 👇 CORRECCIÓN AQUÍ
      const res = await authFetch(
        'http://localhost:5001/api/student/my-applications'
      );
      if (!res.ok) throw new Error('Error fetching applications');
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  // 2. Citas (URL Genérica, asegurate que exista en el backend)
  const { data: myAppointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await authFetch('http://localhost:5001/api/appointments');
      if (!res.ok) return []; // Si falla, retornamos vacío para no romper la pantalla
      return res.json();
    },
  });

  // 3. Perfil (Para el score)
  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const res = await authFetch(
        `http://localhost:5001/api/profile/${user.id}`
      );
      return res.json();
    },
    enabled: !!user,
  });

  // --- CÁLCULOS ---
  const approvedApps = applications.filter((app) => app.status === 'Aprobado');
  const notifications = applications.filter(
    (app) => app.status !== 'Pendiente'
  );

  let studentScore = 20;
  if (applications.length > 0) studentScore += 40;
  if (profileData?.certifications?.length > 0) studentScore += 40;
  const isLoading = loadingApps || loadingAppts;

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
    let token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      // Nota: Asegúrate que esta ruta exista en tu backend o usa la de tutor-requests
      const res = await fetch('http://localhost:5001/api/tutor-requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setVisualNotification({
          message: '✅ Archivo Subido',
          type: 'success',
        });
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
      setVisualNotification({ message: 'Error al agendar', type: 'error' });
    } finally {
      setScheduling(false);
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
        <ModalOverlay
          title="Subir Documento"
          onClose={() => setShowCVModal(false)}
        >
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
              {uploading ? 'Subiendo...' : 'Enviar'}
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

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative z-40">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Hola, {user?.name}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Panel de estudiante.
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
              <h4 className="font-bold mb-2">Actualizaciones</h4>
              {notifications.length === 0 && (
                <p className="text-xs text-gray-400">Sin novedades</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="text-sm py-2 border-b">
                  {n.opportunity_title}: {n.status}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            {' '}
            <StatSkeleton /> <StatSkeleton /> <StatSkeleton />{' '}
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

      {/* SCORE CARD */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  className={`p-1 rounded-full ${studentScore >= 20 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <CheckCircle size={14} />
                </div>
                <span>Registro completado (20%)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`p-1 rounded-full ${studentScore >= 60 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <CheckCircle size={14} />
                </div>
                <span>Postulación enviada (40%)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`p-1 rounded-full ${studentScore >= 100 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <CheckCircle size={14} />
                </div>
                <span>Formación Académica (40%)</span>
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
                  <Cell fill="#10B981" /> <Cell fill="#334155" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black">{studentScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES Y LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-400 font-medium">Sin actividad.</p>
                </div>
              ) : (
                applications
                  .slice(0, 3)
                  .map((item) => (
                    <ApplicationCard
                      key={item.id}
                      title={item.opportunity_title}
                      subtitle="Tu postulación"
                      status={item.status}
                      date={item.date}
                      onClick={() => navigate('/mis-postulaciones')}
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

export default StudentDashboard;
