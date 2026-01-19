import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google'; // <--- 1. IMPORTAR ESTO
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';
import NewOpportunity from './pages/NewOpportunity';
import ApplicationsAdmin from './pages/ApplicationsAdmin';
import MyApplications from './pages/MyApplications';

function App() {
  return (
    /* 2. ENVOLVER TODO CON EL PROVIDER Y TU ID */
    <GoogleOAuthProvider clientId="282229570814-h2f8ok7uh91tddg8eltu6cfeeqi5u9j8.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />{' '}
            {/* <--- TU RUTA DE REGISTRO */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/oportunidades" element={<Opportunities />} />
              <Route path="/perfil" element={<Profile />} />
              <Route
                path="/admin/postulaciones"
                element={<ApplicationsAdmin />}
              />
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
