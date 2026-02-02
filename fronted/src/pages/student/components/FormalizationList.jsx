import React from 'react';
import { BookOpen, UserCheck, Mail, FileText } from 'lucide-react';

const FormalizationList = ({
  form,
  onSubmit,
  loading,
  requests,
  onDownload,
}) => {
  const { register, handleSubmit } = form;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BookOpen className="text-blue-600" /> Formalización
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* SUBIDA DE DOCUMENTOS */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register('docTitle', { required: true })}
              type="text"
              placeholder="Título Documento"
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
            />
            <input
              {...register('file', { required: true })}
              type="file"
              accept=".pdf"
              className="w-full text-sm text-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>

        {/* LISTA DE SOLICITUDES */}
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {req.title}
                  </p>
                  <p className="text-xs text-slate-400">{req.date}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    req.status === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-700'
                      : req.status === 'Aprobado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {/* TUTOR ASIGNADO Y DESCARGA */}
              {req.assigned_tutor && (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-2">
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                      <UserCheck size={14} /> Docente Asignado
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {req.assigned_tutor}
                    </p>
                    {req.tutor_email && (
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium">
                        <Mail size={12} /> {req.tutor_email}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      req.memo_filename && onDownload(req.memo_filename)
                    }
                    disabled={!req.memo_filename}
                    className={`w-full mt-2 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all
                      ${
                        req.memo_filename
                          ? 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer shadow-sm'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
                      }`}
                  >
                    <FileText size={14} />
                    {req.memo_filename
                      ? 'Descargar Memo de Asignación'
                      : 'AVAL Pendiente de Carga'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-slate-400 text-sm italic text-center py-4">
              No has enviado documentos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormalizationList;
