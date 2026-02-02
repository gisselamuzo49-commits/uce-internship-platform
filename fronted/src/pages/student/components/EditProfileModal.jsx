import React from 'react';
import { X } from 'lucide-react';

const EditProfileModal = ({ form, onSubmit, loading, onClose }) => {
  const { register, handleSubmit } = form;

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[9999] flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold">Editar Datos</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register('name', { required: true })}
            type="text"
            className="w-full p-3 border rounded-xl"
            placeholder="Nombre"
          />
          <input
            {...register('password')}
            type="password"
            placeholder="Nueva Contraseña (Opcional)"
            className="w-full p-3 border rounded-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
