import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Save, Edit, Trash2, X } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experience, setExperience] = useState([]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    career: user?.career || 'Ingeniería en Sistemas',
    faculty: user?.faculty || 'Facultad de Ingeniería',
    phone: user?.phone || '',
    gpa: user?.gpa || '9.2',
  });

  const [newExp, setNewExp] = useState({ title: '', company: '', date: '' });

  useEffect(() => {
    const loadExp = async () => {
      if (user?.id) {
        const res = await fetch(
          `http://localhost:5000/api/experience/${user.id}`
        );
        if (res.ok) setExperience(await res.json());
      }
    };
    loadExp();
  }, [user]);

  const handleSaveProfile = async () => {
    const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      localStorage.setItem('siiu_user', JSON.stringify(data));
      setIsEditing(false);
      alert('Perfil actualizado');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newExp, user_id: user.id }),
    });
    if (res.ok) {
      const saved = await res.json();
      setExperience([...experience, saved]);
      setIsModalOpen(false);
      setNewExp({ title: '', company: '', date: '' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar registro?')) return;
    const res = await fetch(`http://localhost:5000/api/experience/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) setExperience(experience.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-8 p-4 animate-fade-in">
      {/* HEADER DE PERFIL */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#0f172a] rounded-[2rem] flex items-center justify-center text-4xl font-black text-white">
            {formData.name.charAt(0)}
          </div>
          <div>
            {isEditing ? (
              <input
                className="text-2xl font-black border-b-2 border-indigo-600 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            ) : (
              <h1 className="text-2xl font-black text-[#0f172a] uppercase">
                {formData.name}
              </h1>
            )}
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {formData.career}
            </p>
          </div>
        </div>
        <button
          onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
          className="bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold flex gap-2"
        >
          {isEditing ? <Save size={18} /> : <Edit size={18} />}{' '}
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      {/* SECCIÓN EXPERIENCIA */}
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[#0f172a] flex items-center gap-2">
            <Briefcase size={20} /> Experiencia Laboral
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
          >
            + AGREGAR
          </button>
        </div>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div
              key={exp.id}
              className="group flex justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all"
            >
              <div>
                <h4 className="font-black text-sm uppercase">{exp.title}</h4>
                <p className="text-xs text-indigo-600 font-bold">
                  {exp.company} • {exp.date}
                </p>
              </div>
              <button
                onClick={() => handleDelete(exp.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black mb-6">Nueva Experiencia</h2>
            <form onSubmit={handleAddExperience} className="space-y-4">
              <input
                required
                placeholder="Cargo"
                className="w-full bg-slate-50 p-4 rounded-xl border"
                value={newExp.title}
                onChange={(e) =>
                  setNewExp({ ...newExp, title: e.target.value })
                }
              />
              <input
                required
                placeholder="Empresa"
                className="w-full bg-slate-50 p-4 rounded-xl border"
                value={newExp.company}
                onChange={(e) =>
                  setNewExp({ ...newExp, company: e.target.value })
                }
              />
              <input
                required
                placeholder="Periodo"
                className="w-full bg-slate-50 p-4 rounded-xl border"
                value={newExp.date}
                onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
              />
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 py-3 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0f172a] text-white py-3 rounded-xl font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
