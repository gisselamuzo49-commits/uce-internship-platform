import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  LogOut,
  HeartHandshake,
  GraduationCap,
  Users,
  UserCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation links based on user role
  const links =
    user?.role === 'admin'
      ? [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          // Requests management (approve/reject/view CV)
          { name: 'Solicitudes', path: '/admin/solicitudes', icon: Users },
          // Reports (Excel/Calendar)
          { name: 'Postulantes', path: '/admin/postulantes', icon: UserCheck },
          // Opportunities management (create/edit/delete)
          { name: 'Ofertas', path: '/admin/ofertas', icon: Briefcase },
          { name: 'Mi Perfil', path: '/perfil', icon: User },
        ]
      : [
          // Student navigation links
          { name: 'Inicio', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Prácticas', path: '/practicas', icon: Briefcase },
          { name: 'Vinculación', path: '/vinculacion', icon: HeartHandshake },
          {
            name: 'Mis Postulaciones',
            path: '/mis-postulaciones',
            icon: FileText,
          },
          { name: 'Mi Perfil', path: '/perfil', icon: User },
        ];

  return (
    <nav className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50">
      {/* Application logo and branding */}
      <div className="p-8 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-900/50">
          <GraduationCap size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SIIU</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
            UCE Conecta
          </p>
        </div>
      </div>

      {/* Navigation links section */}
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium group
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }
              `}
            >
              <link.icon
                size={20}
                className={
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 group-hover:text-white transition-colors'
                }
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User profile and logout section */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold border-2 border-slate-600">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'student' ? 'Estudiante' : 'Administrador'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-600/90 text-slate-300 hover:text-white py-2.5 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider border border-slate-700 hover:border-red-500"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
