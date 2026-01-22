import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// --- LAYOUTS Y COMPONENTES ---
import MainLayout from './layouts/MainLayout';

// --- PAGINAS ---
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import NewOpportunity from './pages/NewOpportunity';
import MyApplications from './pages/MyApplications';
import UserProfile from './pages/Profile';

// Esta es la pagina del Excel (Asegurate que el archivo exista en src/pages/Postulantes.jsx)
import Postulantes from './pages/Postulantes';

function App() {
  return (
    <GoogleOAuthProvider clientId="282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Privadas con el Diseño Principal (Barra lateral, etc) */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/oportunidades" element={<Opportunities />} />
              <Route path="/perfil" element={<UserProfile />} />

              {/* --- AQUÍ ESTABA EL ERROR: AHORA ESTÁ CORREGIDO --- */}
              {/* Esta ruta carga la tabla con el botón de Excel */}
              <Route path="/admin/postulaciones" element={<Postulantes />} />

              <Route
                path="/admin/nueva-oportunidad"
                element={<NewOpportunity />}
              />
              <Route path="/mis-postulaciones" element={<MyApplications />} />

              {/* Redirección por defecto */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
