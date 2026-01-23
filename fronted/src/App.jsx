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

// Importamos las DOS páginas de admin
import AdminRequests from './pages/AdminRequests'; // Panel de Gestión
import Postulantes from './pages/Postulantes'; // Reportes Excel

function App() {
  return (
    <GoogleOAuthProvider clientId="282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Privadas con el Diseño Principal */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/oportunidades" element={<Opportunities />} />
              <Route path="/perfil" element={<UserProfile />} />

              {/* --- ZONA ADMINISTRADOR --- */}

              {/* 1. GESTIÓN: Panel avanzado (Aprobar/Rechazar/Tutores) */}
              <Route path="/admin/postulaciones" element={<AdminRequests />} />

              {/* 2. REPORTES: Tabla simple y descarga de Excel */}
              <Route path="/admin/reportes" element={<Postulantes />} />

              {/* 3. CREAR VACANTE */}
              <Route
                path="/admin/nueva-oportunidad"
                element={<NewOpportunity />}
              />

              {/* --- ZONA ESTUDIANTE --- */}
              <Route path="/mis-postulaciones" element={<MyApplications />} />

              {/* Redirección por defecto (Siempre al final) */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
