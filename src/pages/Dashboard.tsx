
import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAuthorization } from '@/context/AuthorizationContext';
import { Loader2 } from 'lucide-react';
import StudentDashboard from "@/components/layouts/StudentDashboard";
import StartupDashboard from "@/components/layouts/StartupDashboard";
import CollegeAdminDashboard from "@/components/layouts/CollegeAdminDashboard";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { userRole } = useAuthorization();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  // Render appropriate dashboard based on user role
  const renderDashboardContent = () => {
    // Check if profile exists and has required fields
    if (!profile || !profile.name) {
      return <Navigate to="/complete-profile" />;
    }

    switch (userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'startup':
        return <StartupDashboard />;
      case 'college_admin':
        return <CollegeAdminDashboard />;
      case 'platform_admin':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold">Platform Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2 mb-6">
              Welcome, {profile?.name}! Manage the entire platform.
            </p>
            <div className="bg-muted p-8 rounded-lg text-center">
              <p>Platform admin dashboard coming soon.</p>
            </div>
          </div>
        );
      default:
        return <StudentDashboard />;
    }
  };
  
  return (
    <DashboardLayout activeTab="dashboard">
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
