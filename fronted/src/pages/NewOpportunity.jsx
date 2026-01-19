import React, { useState } from 'react';

const NewOpportunity = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
  });

  // Usamos dos estados separados para controlar los colores
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Limpiamos mensajes anteriores
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ÉXITO: Ponemos el mensaje en la variable de éxito
        setSuccessMessage('¡Oportunidad publicada correctamente!');
        setFormData({ title: '', company: '', description: '' }); // Limpiar formulario
      } else {
        // ERROR: Ponemos el mensaje en la variable de error
        setErrorMessage(data.error || 'Error al publicar la oportunidad');
      }
    } catch (error) {
      setErrorMessage('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">
          Nueva Oportunidad
        </h2>

        {/* --- AQUÍ ESTÁ LA MAGIA DE LOS COLORES --- */}

        {/* 1. Mensaje de ÉXITO (VERDE) */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm">
            <p className="font-bold">¡Éxito!</p>
            <p>{successMessage}</p>
          </div>
        )}

        {/* 2. Mensaje de ERROR (ROJO) */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* --- FIN DE LA MAGIA --- */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Título del Puesto
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Desarrollador Junior"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Empresa / Institución
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Ministerio de Salud"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              required
              rows="4"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Detalles de la pasantía..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Publicando...' : 'Publicar Oportunidad'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewOpportunity;
