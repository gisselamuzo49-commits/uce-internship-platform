import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// 👇 Importamos componentes de Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import {
  Users,
  FileText,
  Briefcase,
  Plus,
  TrendingUp,
  Calendar,
  Clock,
  User,
  BarChart3, // Icono nuevo
  Activity, // Icono nuevo
} from 'lucide-react';
import { StatCard, ModalOverlay } from './components/DashboardUI';

const AdminDashboard = () => {
  const { authFetch, user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estados de formulario... (Sin cambios)
  const [newOpp, setNewOpp] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    deadline: '',
    vacancies: 1,
    type: 'pasantia',
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () =>
      (await authFetch('http://localhost:5001/api/admin/stats')).json(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () =>
      (await authFetch('http://localhost:5001/api/admin/appointments')).json(),
  });

  // Mutación para crear oferta... (Sin cambios)
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authFetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear');
      return res.json();
    },
    onSuccess: () => {
      alert('✅ Oferta publicada con éxito');
      setShowCreateModal(false);
      setNewOpp({
        title: '',
        company: '',
        description: '',
        location: '',
        deadline: '',
        vacancies: 1,
        type: 'pasantia',
      });
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newOpp);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Panel de Control
          </h1>
          <p className="text-slate-500">
            Bienvenido, Administrador {user?.name}
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Estudiantes"
          value={stats?.students || 0}
          icon={Users}
          colorBg="bg-blue-50"
          colorText="text-blue-600"
        />
        <StatCard
          title="Solicitudes"
          value={stats?.applications || 0}
          icon={FileText}
          colorBg="bg-purple-50"
          colorText="text-purple-600"
        />
        <StatCard
          title="Pendientes"
          value={stats?.pending || 0}
          icon={TrendingUp}
          colorBg="bg-orange-50"
          colorText="text-orange-600"
        />
        <StatCard
          title="Ofertas Activas"
          value={stats?.opportunities || 0}
          icon={Briefcase}
          colorBg="bg-emerald-50"
          colorText="text-emerald-600"
        />
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: GESTIÓN RÁPIDA */}
        <div className="lg:col-span-1 space-y-8">
          <div className="h-fit bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Gestión Rápida
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              <Plus size={20} /> Publicar Nueva Oferta
            </button>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg text-sm font-bold">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>{' '}
                Sistema Operativo
              </div>
            </div>
          </div>

          {/* 👇 GRÁFICA 4: CARGA DE TUTORES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" /> Carga de
              Tutores
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.tutor_workload || []} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="estudiantes"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-2 space-y-8">
          {/* AGENDA DE ENTREVISTAS (Tu código original) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="text-blue-600" /> Agenda de Entrevistas
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {appointments.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 font-bold">
                    No hay entrevistas programadas.
                  </p>
                </div>
              ) : (
                appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl text-blue-600 font-black text-center min-w-[70px] border border-slate-200">
                        {appt.time}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {appt.opportunity_title}
                        </h4>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <User size={12} />
                          {appt.student_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {appt.date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 👇 GRÁFICA 5: ACTIVIDAD RECIENTE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-rose-500" /> Tendencia de Postulaciones
              (7 días)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.activity_trend || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="fecha"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="postulaciones"
                    stroke="#f43f5e"
                    strokeWidth={4}
                    dot={{
                      r: 6,
                      fill: '#f43f5e',
                      strokeWidth: 2,
                      stroke: '#fff',
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CREAR OFERTA (Sin cambios) */}
      {showCreateModal && (
        <ModalOverlay
          title="Publicar Nueva Vacante"
          onClose={() => setShowCreateModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (campos de tu formulario original) ... */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              {createMutation.isPending ? 'Publicando...' : 'Publicar Oferta'}
            </button>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
};

export default AdminDashboard;
