import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Award, Plus, Trash2, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// IMPORTANTE: Asegúrate de que la ruta del componente Notification sea correcta
import Notification from '../components/Notification';

const Profile = () => {
  const { user, authFetch, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  // Estados para datos
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({
    title: '',
    institution: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);

  // ESTADO PARA NOTIFICACIONES (Mensajes de éxito/error)
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    if (user?.certifications) setCertifications(user.certifications);
  }, [user]);

  // Función para mostrar notificaciones temporalmente
  const showMsg = (message, type) => {
    setNotification({ message, type });
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newCert.title || !newCert.institution) return;

    setLoading(true);
    try {
      const res = await authFetch('http://localhost:5001/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      });

      const data = await res.json();

      if (res.ok) {
        setCertifications(data.certifications);
        updateLocalUser({ ...user, certifications: data.certifications });
        setNewCert({ title: '', institution: '', year: '' });
        // ✅ ÉXITO EN VERDE
        showMsg('¡Certificación guardada con éxito!', 'success');
      } else {
        // ❌ ERROR EN ROJO
        showMsg(data.error || 'Error al guardar la certificación', 'error');
      }
    } catch (error) {
      showMsg('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
      const res = await authFetch(
        `http://localhost:5001/api/certifications/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        const updated = certifications.filter((c) => c.id !== id);
        setCertifications(updated);
        updateLocalUser({ ...user, certifications: updated });
        // ✅ ÉXITO EN VERDE
        showMsg('Certificación eliminada correctamente', 'success');
      } else {
        showMsg('No se pudo eliminar la certificación', 'error');
      }
    } catch (error) {
      showMsg('Error al procesar la solicitud', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in relative">
      {/* COMPONENTE DE NOTIFICACIÓN */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: null })}
      />

      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition font-bold"
      >
        <ArrowLeft size={20} /> Volver al Panel
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INFO PERFIL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center h-fit">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 border-4 border-blue-50">
            <User size={40} />
          </div>
          <h2 className="font-bold text-xl text-slate-800">{user?.name}</h2>
          <p className="text-slate-500 text-xs uppercase font-black tracking-widest mt-1">
            {user?.role}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-50 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Correo Electrónico
            </p>
            <p className="text-sm text-slate-700 font-medium">{user?.email}</p>
          </div>
        </div>

        {/* SECCIÓN DE EDUCACIÓN */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Award className="text-orange-500" /> Trayectoria Académica
          </h2>

          <div className="space-y-4 mb-8">
            {certifications.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm italic">
                  No has agregado certificaciones aún.
                </p>
              </div>
            ) : (
              certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition group"
                >
                  <div>
                    <h3 className="font-bold text-slate-800">{cert.title}</h3>
                    <p className="text-sm text-slate-500">
                      {cert.institution} — {cert.year}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCert(cert.id)}
                    className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* FORMULARIO AGREGAR */}
          <form
            onSubmit={handleAddCert}
            className="space-y-4 pt-6 border-t border-slate-100"
          >
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
              Agregar nuevo curso
            </h3>
            <input
              placeholder="Título del curso o certificación"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={newCert.title}
              onChange={(e) =>
                setNewCert({ ...newCert, title: e.target.value })
              }
              required
            />
            <div className="flex gap-4">
              <input
                placeholder="Institución"
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newCert.institution}
                onChange={(e) =>
                  setNewCert({ ...newCert, institution: e.target.value })
                }
                required
              />
              <input
                placeholder="Año"
                type="number"
                className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newCert.year}
                onChange={(e) =>
                  setNewCert({ ...newCert, year: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Plus size={20} />
              )}
              {loading ? 'Guardando...' : 'Guardar Certificación'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
