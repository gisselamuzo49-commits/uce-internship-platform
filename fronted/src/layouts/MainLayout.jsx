import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Search,
  LogOut,
  User,
  FileSpreadsheet, // Icono para el Excel (Postulantes)
  FileText, // Icono para Mis Postulaciones (Estudiante)
  PlusCircle, // Icono para Nueva Oportunidad
  Users,
} from 'lucide-react';

const MainLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  // Check if user is admin (case-insensitive)
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  const menuItems = isAdmin
    ? [
        // Admin navigation menu
        {
          path: '/dashboard',
          icon: LayoutDashboard,
          label: 'Dashboard',
        },
        {
          // Manage student requests (approve/reject)
          path: '/admin/postulaciones',
          icon: Briefcase,
          label: 'Gestionar Solicitudes',
        },
        {
          // Student applications report
          path: '/admin/reportes',
          icon: FileSpreadsheet,
          label: 'Postulantes (Excel)',
        },
        {
          path: '/admin/nueva-oportunidad',
          icon: PlusCircle,
          label: 'Nueva Oportunidad',
        },
      ]
    : [
        // Student navigation menu
        {
          path: '/dashboard',
          icon: LayoutDashboard,
          label: 'Dashboard',
        },
        {
          path: '/oportunidades',
          icon: Search,
          label: 'Buscar Oportunidades',
        },
        {
          path: '/mis-postulaciones',
          icon: FileText,
          label: 'Mis Postulaciones',
        },
        {
          path: '/perfil',
          icon: User,
          label: 'Mi Perfil',
        },
      ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Left sidebar navigation */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col fixed h-full z-50">
        <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
            U
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-lg">SIIU</h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">
              Conecta
            </p>
          </div>
        </div>

        <nav className="p-4 mt-4 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="mb-4 px-2">
            <p className="text-xs font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md h-16 flex items-center px-8 justify-between border-b border-slate-100 z-40">
          <div className="text-sm font-semibold text-slate-400 italic uppercase tracking-tighter">
            SIIU CONECTA Portal
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/perfil"
              className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer uppercase"
            >
              {user?.name?.charAt(0)}
            </Link>
          </div>
        </header>

        {/* Page content rendered here */}
        <div className="flex-1 overflow-auto p-10 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
