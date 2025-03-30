
import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import ProjectDashboard from "@/components/layouts/ProjectDashboard";
import { Navigate } from 'react-router-dom';

const DashboardPage = () => {
  const { profile } = useAuth();

  // If user isn't loaded yet, this will be caught by the ProtectedRoute
  
  // Ensure startup or student dashboard is shown based on user role
  return (
    <DashboardLayout activeTab="dashboard">
      <ProjectDashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
