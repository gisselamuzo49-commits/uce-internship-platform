import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Users,
  CheckCircle,
  LayoutDashboard,
  TrendingUp,
  PlusCircle,
  Bell,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Notification from '../../components/Notification.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

import {
  QuickActionCard,
  StatCard,
  ApplicationCard,
  ModalOverlay,
  StatSkeleton,
} from './components/DashboardUI.jsx';

const AdminDashboard = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const COLORS = ['#10B981', '#F59E0B', '#F43F5E'];

  // --- ESTADOS ---
  const [showOppModal, setShowOppModal] = useState(false);
  const [creatingOpp, setCreatingOpp] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [visualNotification, setVisualNotification] = useState({
    message: null,
    type: null,
  });
  const [oppData, setOppData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    deadline: '',
    vacancies: 1,
  });

  // --- QUERIES ---
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['applications', 'admin'],
    queryFn: async () => {
      const res = await authFetch(
        'http://localhost:5001/api/admin/applications'
      );
      if (!res.ok) throw new Error('Error fetching applications');
      return res.json();
    },
    staleTime: 1000 * 60,
    refetchInterval: 5000,
  });

  const { data: opportunities = [], isLoading: loadingOpps } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      // Usamos fetch normal o authFetch según tu backend (si es público o privado)
      const res = await fetch('http://localhost:5001/api/opportunities');
      if (!res.ok) throw new Error('Error fetching opportunities');
      return res.json();
    },
  });

  // --- CÁLCULOS ---
  const pendingApps = applications.filter((app) => app.status === 'Pendiente');
  const approvedApps = applications.filter((app) => app.status === 'Aprobado');
  const rejectedApps = applications.filter((app) => app.status === 'Rechazado');
  const adminStats = [
    { name: 'Aprobados', value: approvedApps.length },
    { name: 'Pendientes', value: pendingApps.length },
    { name: 'Rechazados', value: rejectedApps.length },
  ];
  // Ultimas 5 postulaciones
  const listData = [...applications].reverse().slice(0, 5);
  const isLoading = loadingApps || loadingOpps;

  // --- HANDLER CREAR OPORTUNIDAD ---
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
        queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      } else {
        setVisualNotification({
          message: '❌ Error al publicar',
          type: 'error',
        });
      }
    } catch (e) {
      setVisualNotification({ message: '❌ Error de conexión', type: 'error' });
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

      {/* MODAL VACANTE */}
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
              <input
                type="date"
                value={oppData.deadline}
                onChange={(e) =>
                  setOppData({ ...oppData, deadline: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
                required
              />
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
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase">
              Admin
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Panel de control administrativo.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 relative"
          >
            <Bell size={20} />
            {pendingApps.length > 0 && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4">
              <h4 className="font-bold mb-2">Pendientes</h4>
              {pendingApps.length === 0 && (
                <p className="text-xs text-gray-400">Todo al día</p>
              )}
              {pendingApps.slice(0, 5).map((n) => (
                <div key={n.id} className="text-sm py-2 border-b">
                  {n.opportunity_title} - {n.student_name}
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
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Briefcase}
              title="Vacantes"
              value={opportunities.length || '0'}
              colorBg="bg-blue-50"
              colorText="text-blue-600"
            />
            <StatCard
              icon={Users}
              title="Postulantes"
              value={applications.length || '0'}
              colorBg="bg-green-50"
              colorText="text-green-600"
            />
            <StatCard
              icon={CheckCircle}
              title="Contratados"
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
        )}
      </div>

      {/* GRÁFICA PIE */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {!isLoading && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-3 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Tasa de Aprobación
              </h3>
              <div className="mt-4 space-y-2">
                {adminStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
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
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {listData.length === 0 ? (
                <p className="text-slate-400">Sin actividad reciente.</p>
              ) : (
                listData.map((item) => (
                  <ApplicationCard
                    key={item.id}
                    title={item.opportunity_title}
                    subtitle={`Estudiante: ${item.student_name}`}
                    status={item.status}
                    date={item.date}
                    tags={item.attributes}
                    onClick={() => navigate('/admin/postulaciones')}
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

export default AdminDashboard;
