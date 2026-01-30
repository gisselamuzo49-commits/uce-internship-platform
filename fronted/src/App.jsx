import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- COMPONENTES GLOBALES ---
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// --- PÁGINAS DE ESTUDIANTE ---
import UserProfile from './pages/student/Profile';
import Opportunities from './pages/student/Opportunities';
import MyApplications from './pages/student/MyApplications';
import StudentDashboard from './pages/student/StudentDashboard';

// --- PÁGINAS DE ADMIN ---
import AdminDashboard from './pages/panel_control/AdminDashboard';
import AdminRequests from './pages/panel_control/AdminRequests'; // La tabla de aprobaciones y CVs
import AdminOpportunities from './pages/panel_control/AdminOpportunities'; // Editar/Borrar Ofertas
import Postulantes from './pages/panel_control/Postulantes'; // El reporte Excel (Nuevo)

// 1. REDIRECCIÓN INTELIGENTE
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'student') return <StudentDashboard />;

  return <Navigate to="/login" />;
};

// 2. PROTECCIÓN DE RUTAS
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// 3. LAYOUT (Maneja el Sidebar y el margen)
const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebar = ['/login', '/register', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {!hideSidebar && <Navbar />}

      {/* 'ml-64' empuja el contenido a la derecha cuando está el sidebar */}
      <main
        className={`relative transition-all duration-300 ${!hideSidebar ? 'ml-64' : 'ml-0'}`}
      >
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
};

// 4. APP PRINCIPAL
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Dashboard Inteligente */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* --- RUTAS ESTUDIANTE --- */}
            <Route
              path="/practicas"
              element={
                <ProtectedRoute role="student">
                  <Opportunities type="pasantia" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vinculacion"
              element={
                <ProtectedRoute role="student">
                  <Opportunities type="vinculacion" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mis-postulaciones"
              element={
                <ProtectedRoute role="student">
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* --- RUTAS ADMINISTRADOR --- */}

            {/* 1. Solicitudes (Aprobar, Rechazar, Ver CV) */}
            <Route
              path="/admin/solicitudes"
              element={
                <ProtectedRoute role="admin">
                  <AdminRequests />
                </ProtectedRoute>
              }
            />

            {/* 2. Postulantes (Reporte Excel) - ¡NUEVA! */}
            <Route
              path="/admin/postulantes"
              element={
                <ProtectedRoute role="admin">
                  <Postulantes />
                </ProtectedRoute>
              }
            />

            {/* 3. Ofertas (Gestión) */}
            <Route
              path="/admin/ofertas"
              element={
                <ProtectedRoute role="admin">
                  <AdminOpportunities />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
