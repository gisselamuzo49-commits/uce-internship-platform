import React from 'react';
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // LÓGICA DE FILTRADO POR ROL
  const menuItems =
    user?.role === 'admin'
      ? [
          {
            icon: LayoutDashboard,
            text: 'Panel de Control',
            path: '/dashboard',
          },
          {
            icon: FileText,
            text: 'Gestionar Postulantes',
            path: '/admin/postulaciones',
          },
          {
            icon: PlusCircle,
            text: 'Nueva Oportunidad',
            path: '/admin/nueva-oportunidad',
          },
        ]
      : [
          { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
          {
            icon: Search,
            text: 'Buscar Oportunidades',
            path: '/oportunidades',
          },
          {
            icon: FileText,
            text: 'Mis Postulaciones',
            path: '/mis-postulaciones',
          },
          { icon: User, text: 'Mi Perfil', path: '/perfil' },
        ];

  return (
    <aside className="w-64 bg-[#0f172a] text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="bg-yellow-400 text-[#0f172a] font-black text-xs px-2 py-1 rounded mr-3 uppercase">
          SIIU
        </div>
        <span className="font-bold text-lg tracking-wide">CONECTA</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon
              size={20}
              className={isActive(item.path) ? 'text-yellow-400' : ''}
            />
            <span className="text-sm font-bold">{item.text}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-[#0f172a] font-black">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-rose-400 py-3 hover:bg-rose-500/10 rounded-xl transition-all font-bold"
        >
          <LogOut size={14} /> CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
