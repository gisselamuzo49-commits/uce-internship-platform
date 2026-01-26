import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Si es admin, mostramos el panel de admin
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Si no, mostramos el del estudiante
  return <StudentDashboard />;
};

export default Dashboard;
