
import React, { useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import ProjectDashboard from "@/components/layouts/ProjectDashboard";
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthorization } from '@/context/AuthorizationContext';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { userRole } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the appropriate sign-in page if the user is not logged in
    // This is a fallback since ProtectedRoute should handle this already
    if (!user) {
      navigate('/signin');
      return;
    }
    
    // If profile is not completed, redirect to complete profile page
    if (profile && !profile.name) {
      navigate('/complete-profile');
      return;
    }
  }, [user, profile, navigate]);
  
  return (
    <DashboardLayout activeTab="dashboard">
      <ProjectDashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
