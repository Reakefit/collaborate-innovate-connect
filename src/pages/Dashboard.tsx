
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthorization } from '@/context/AuthorizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, BarChart3, Users, FileText, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StudentDashboard from "@/components/layouts/StudentDashboard";
import StartupDashboard from "@/components/layouts/StartupDashboard";
import CollegeAdminDashboard from "@/components/layouts/CollegeAdminDashboard";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { userRole, isVerified } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the appropriate sign-in page if the user is not logged in
    if (!loading && !user) {
      navigate('/signin');
      return;
    }
    
    // If profile is not completed, redirect to complete profile page
    if (!loading && profile && !profile.name) {
      navigate('/complete-profile');
      return;
    }
  }, [user, profile, navigate, loading]);
  
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

  // Render profile completion notice if needed
  if (!profile || !profile.name) {
    return (
      <DashboardLayout activeTab="dashboard">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please complete your profile to access all features
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
            <p className="mb-4 text-center">
              Your profile is incomplete. We need more information to match you with the right opportunities.
            </p>
            <Button onClick={() => navigate('/complete-profile')}>
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Student verification check
  if (userRole === 'student' && !isVerified) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.name || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            One more step to unlock all features
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verify Your College Affiliation</CardTitle>
            <CardDescription>
              Please verify your college affiliation to access all student features
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
            <p className="mb-4 text-center">
              Your college affiliation needs to be verified. This helps startups know you're a legitimate student.
            </p>
            <Button onClick={() => navigate('/verify-college')}>
              Verify Now
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Role-based dashboard content
  const renderDashboardContent = () => {
    switch (userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'startup':
        return <StartupDashboard />;
      case 'college_admin':
        return <CollegeAdminDashboard />;
      case 'platform_admin':
        return (
          <div className="space-y-6">
            {/* Dashboard content for platform admin */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Administration</CardTitle>
                <CardDescription>
                  Manage the entire platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Platform admin dashboard coming soon.</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No projects yet
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No teams yet
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No messages yet
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-amber-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No recent activity
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to Student-Startup Connect!</CardTitle>
                <CardDescription>
                  This is your dashboard. Get started by exploring the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <div className="w-full max-w-md space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(userRole === 'startup' ? '/create-project' : '/projects')}
                  >
                    {userRole === 'startup' ? 'Create Your First Project' : 'Find Projects'}
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    Complete Your Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };
  
  return (
    <DashboardLayout activeTab="dashboard">
      {userRole === 'college_admin' ? (
        // College Admin Dashboard Header
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Club Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name || 'Admin'}! Here's what's happening.
          </p>
        </div>
      ) : userRole === 'startup' ? (
        // Startup Dashboard Header
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Startup Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, {profile?.name || 'User'}! Manage your projects and find talented students.
          </p>
        </div>
      ) : userRole === 'platform_admin' ? (
        // Platform Admin Dashboard Header
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, {profile?.name || 'Admin'}! Manage the entire platform.
          </p>
        </div>
      ) : (
        // Student Dashboard Header
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.name || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            Explore projects and build your portfolio.
          </p>
        </div>
      )}

      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
