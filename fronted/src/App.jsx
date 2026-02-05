import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Global components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import UserProfile from './pages/student/Profile';
import Opportunities from './pages/student/Opportunities';
import MyApplications from './pages/student/MyApplications';
import StudentDashboard from './pages/student/StudentDashboard';

// Admin pages
import AdminDashboard from './pages/panel_control/AdminDashboard';
import AdminRequests from './pages/panel_control/AdminRequests';
import AdminOpportunities from './pages/panel_control/AdminOpportunities';
import Postulantes from './pages/panel_control/Postulantes';

// Redirect to appropriate dashboard based on user role
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

// Protected route wrapper to enforce role-based access
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

// Main layout component with conditional sidebar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebar = ['/login', '/register', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {!hideSidebar && <Navbar />}

      {/* Sidebar margin pushes content to the right */}
      <main
        className={`relative transition-all duration-300 ${!hideSidebar ? 'ml-64' : 'ml-0'}`}
      >
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
};

// Main application component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Smart dashboard redirects based on user role */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Student routes */}
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

            {/* Admin routes */}

            {/* Applications and tutor requests management */}
            <Route
              path="/admin/solicitudes"
              element={
                <ProtectedRoute role="admin">
                  <AdminRequests />
                </ProtectedRoute>
              }
            />

            {/* Approved applicants Excel report */}
            <Route
              path="/admin/postulantes"
              element={
                <ProtectedRoute role="admin">
                  <Postulantes />
                </ProtectedRoute>
              }
            />

            {/* Opportunities management */}
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
