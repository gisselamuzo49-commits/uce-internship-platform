import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Award,
  Calendar,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, authFetch, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Datos básicos
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Datos de Certificaciones (LinkedIn style)
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({
    title: '',
    institution: '',
    year: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
      // Si el usuario ya tiene certs cargadas en el login, las ponemos (o podemos hacer fetch)
      if (user.certifications) setCertifications(user.certifications);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch('http://localhost:5001/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        updateLocalUser(data.user);
        alert('Datos actualizados');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newCert.title || !newCert.institution) return;

    try {
      const res = await authFetch('http://localhost:5001/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      });
      const data = await res.json();
      if (res.ok) {
        setCertifications(data.certifications); // Actualizamos lista visual
        setNewCert({ title: '', institution: '', year: '' }); // Limpiar form
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('¿Borrar este curso?')) return;
    try {
      const res = await authFetch(
        `http://localhost:5001/api/certifications/${id}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setCertifications(certifications.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center mb-6">
              <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 border-4 border-blue-50">
                <User size={40} />
              </div>
              <h2 className="font-bold text-slate-800 text-xl">{user?.name}</h2>
              <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">
                {user?.role === 'admin' ? 'Administrador' : 'Estudiante'}
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Nombre
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Nueva Clave
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                  placeholder="Opcional"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-600 transition"
              >
                {loading ? 'Guardando...' : 'Actualizar Datos'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: CURSOS Y CERTIFICACIONES (Estilo LinkedIn) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Award className="text-orange-500" /> Educación y Cursos
              </h2>
            </div>

            {/* Lista de Cursos */}
            <div className="space-y-4 mb-8">
              {certifications.length === 0 ? (
                <p className="text-slate-400 text-sm italic">
                  No has agregado certificaciones aún.
                </p>
              ) : (
                certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-start p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition"
                  >
                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm font-bold border border-slate-100">
                        {cert.institution.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {cert.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {cert.institution}
                        </p>
                        <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 mt-1 inline-block">
                          Año: {cert.year}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-slate-400 hover:text-red-500 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Formulario Agregar */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Plus size={16} /> Agregar Nueva
              </h3>
              <form
                onSubmit={handleAddCert}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2">
                  <input
                    placeholder="Nombre del Curso / Título"
                    className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCert.title}
                    onChange={(e) =>
                      setNewCert({ ...newCert, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <input
                    placeholder="Institución (ej: Coursera)"
                    className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCert.institution}
                    onChange={(e) =>
                      setNewCert({ ...newCert, institution: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <input
                    placeholder="Año (ej: 2024)"
                    className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCert.year}
                    onChange={(e) =>
                      setNewCert({ ...newCert, year: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition"
                  >
                    + Guardar Certificación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
