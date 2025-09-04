import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardLayout /> : <LoginPage />;
};

export default AppContent;