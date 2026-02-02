import React from 'react';
import { User, Mail, Edit } from 'lucide-react';

const ProfileHeader = ({ user, isStudent, onEdit }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* 1. FONDO CON DEGRADADO (Aquí estaba lo que faltaba) */}
      <div
        className={`h-32 relative bg-gradient-to-r ${
          isStudent
            ? 'from-blue-600 to-indigo-700'
            : 'from-slate-800 to-slate-900'
        }`}
      >
        {/* Círculo de la foto de perfil */}
        <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
          <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 border-4 border-white">
            <User size={40} />
          </div>
        </div>

        {/* Botón de Editar (Solo visible si es estudiante) */}
        {isStudent && (
          <button
            onClick={onEdit}
            className="absolute bottom-4 right-8 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
          >
            <Edit size={16} /> Editar Datos
          </button>
        )}
      </div>

      {/* 2. DATOS DEL USUARIO (Debajo del banner) */}
      <div className="pt-16 pb-8 px-8">
        <h1 className="text-3xl font-black text-slate-800">{user.name}</h1>
        <p className="text-slate-500 font-medium flex items-center gap-2">
          <Mail size={14} /> {user.email}
        </p>

        {/* Etiqueta de Rol (Estudiante vs Admin) */}
        <span
          className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
            isStudent
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {isStudent ? 'Estudiante' : 'Administrador'}
        </span>
      </div>
    </div>
  );
};

export default ProfileHeader;
