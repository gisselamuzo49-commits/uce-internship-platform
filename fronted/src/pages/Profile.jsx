import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, FileText, Download, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [cvExists, setCvExists] = useState(false);
  const [loadingCV, setLoadingCV] = useState(true);

  // CONVENCIÓN: La URL siempre es /api/cv/{id}
  const cvUrl = `http://localhost:5001/api/cv/${user?.id}`;

  useEffect(() => {
    const checkCV = async () => {
      if (!user) return;
      try {
        const res = await fetch(cvUrl, { method: 'HEAD' });
        if (res.ok) {
          setCvExists(true);
        }
      } catch (error) {
        console.error('Error verificando CV');
      } finally {
        setLoadingCV(false);
      }
    };
    checkCV();
  }, [user, cvUrl]);

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-4 border-white shadow-lg">
          <User size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">{user.name}</h1>
          <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} /> {user.email}
          </p>
          <div className="mt-2">
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {user.role === 'student' ? 'Estudiante' : 'Administrador'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Mi Hoja de Vida
          </h2>

          {cvExists && (
            <a
              href={cvUrl}
              download={`CV_${user.name}.pdf`}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition flex items-center gap-2"
            >
              <Download size={16} /> Descargar PDF
            </a>
          )}
        </div>

        <div className="p-8 min-h-[400px] flex items-center justify-center bg-slate-100/50">
          {loadingCV ? (
            <p className="text-slate-400 font-bold">Buscando archivo...</p>
          ) : cvExists ? (
            <iframe
              src={cvUrl}
              className="w-full h-[600px] rounded-xl shadow-lg border border-slate-200 bg-white"
              title="Visor de CV"
            ></iframe>
          ) : (
            <div className="text-center text-slate-400">
              <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-slate-400" />
              </div>
              <p className="font-bold text-lg text-slate-600">
                Aún no has subido tu Hoja de Vida.
              </p>
              <p className="text-sm">
                Ve al "Dashboard" y usa el botón "Subir CV".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
