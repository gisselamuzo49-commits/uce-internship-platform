import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import NewOpportunity from './pages/NewOpportunity';
import MyApplications from './pages/MyApplications';

// --- IMPORTANTE: ESTOS SON LOS IMPORTS QUE TE FALTABAN ---
import UserProfile from './pages/Profile';
import AdminRequests from './pages/AdminRequests';

function App() {
  return (
    <GoogleOAuthProvider clientId="282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/oportunidades" element={<Opportunities />} />

              {/* Aquí usamos el UserProfile que importamos arriba */}
              <Route path="/perfil" element={<UserProfile />} />

              {/* Fíjate bien: la ruta es "/admin/postulaciones" */}
              <Route path="/admin/postulaciones" element={<AdminRequests />} />

              <Route
                path="/admin/nueva-oportunidad"
                element={<NewOpportunity />}
              />
              <Route path="/mis-postulaciones" element={<MyApplications />} />

              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
