import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Display admin dashboard if user is admin
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Display student dashboard
  return <StudentDashboard />;
};

export default Dashboard;
