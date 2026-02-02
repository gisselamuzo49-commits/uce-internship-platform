import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

const ExperienceList = ({ form, onSubmit, loading, experiences, onDelete }) => {
  // Extraemos las herramientas del formulario que nos pasa el padre
  const { register, handleSubmit } = form;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Briefcase className="text-purple-600" /> Experiencia Laboral
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input
              {...register('role', { required: true })}
              type="text"
              placeholder="Cargo / Rol"
              className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
            />
            <input
              {...register('company', { required: true })}
              type="text"
              placeholder="Nombre de la Empresa"
              className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-purple-700 ml-1">
                  INICIO
                </label>
                <input
                  {...register('start_date', { required: true })}
                  type="date"
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-purple-700 ml-1">
                  FIN
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <textarea
              {...register('description')}
              placeholder="Descripción breve..."
              rows="3"
              className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex justify-center gap-2 items-center"
            >
              {loading ? (
                '...'
              ) : (
                <>
                  <Plus size={18} /> Agregar Experiencia
                </>
              )}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: LISTA */}
        <div>
          <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">
            Mis Experiencias
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {experiences?.length === 0 && (
              <p className="text-sm text-slate-400 italic">
                No has agregado experiencia.
              </p>
            )}
            {experiences?.map((exp) => (
              <div
                key={exp.id}
                className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative group"
              >
                <button
                  onClick={() => onDelete(exp.id)}
                  className="absolute top-3 right-3 text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <h4 className="font-bold text-slate-800">{exp.role}</h4>
                <p className="text-sm text-slate-500 font-bold">
                  {exp.company} • {exp.start_date} -{' '}
                  {exp.end_date || 'Presente'}
                </p>
                <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceList;
