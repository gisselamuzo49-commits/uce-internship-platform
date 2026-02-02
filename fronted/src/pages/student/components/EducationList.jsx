import React from 'react';
import { Award, Plus, Trash2, GraduationCap } from 'lucide-react';

const EducationList = ({
  form,
  onSubmit,
  loading,
  certifications,
  onDelete,
}) => {
  const { register, handleSubmit } = form;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Award className="text-orange-500" /> Formación
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input
              {...register('title', { required: true })}
              type="text"
              placeholder="Título"
              className="w-full p-3 bg-white border border-orange-200 rounded-xl text-sm"
            />
            <div className="flex gap-2">
              <input
                {...register('institution', { required: true })}
                type="text"
                placeholder="Institución"
                className="w-2/3 p-3 bg-white border border-orange-200 rounded-xl text-sm"
              />
              <input
                {...register('year', { required: true })}
                type="number"
                placeholder="Año"
                className="w-1/3 p-3 bg-white border border-orange-200 rounded-xl text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition flex justify-center gap-2 items-center"
            >
              {loading ? (
                '...'
              ) : (
                <>
                  <Plus size={18} /> Agregar Curso
                </>
              )}
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {certifications?.length === 0 && (
            <p className="text-sm text-slate-400 italic">
              No has agregado cursos.
            </p>
          )}
          {certifications?.map((cert) => (
            <div
              key={cert.id}
              className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-orange-500">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {cert.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {cert.institution} • {cert.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDelete(cert.id)}
                className="p-2 text-slate-300 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationList;
