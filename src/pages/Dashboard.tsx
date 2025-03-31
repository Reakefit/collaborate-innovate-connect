
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthorization } from '@/context/AuthorizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StudentDashboard from "@/components/layouts/StudentDashboard";
import StartupDashboard from "@/components/layouts/StartupDashboard";
import CollegeAdminDashboard from "@/components/layouts/CollegeAdminDashboard";

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

  // Render different dashboard based on user role
  const renderDashboardContent = () => {
    // If profile is missing, show complete profile notice
    if (!profile || !profile.name) {
      return (
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
      );
    }

    // Student verification check
    if (userRole === 'student' && !isVerified) {
      return (
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
      );
    }

    // Role-based dashboards
    switch (userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'startup':
        return <StartupDashboard />;
      case 'college_admin':
        return <CollegeAdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };
  
  return (
    <DashboardLayout activeTab="dashboard">
      {/* Status alerts */}
      {profile && userRole && (
        <div className="mb-6 space-y-4">
          {/* Role indicator */}
          <Alert variant="default" className={
            userRole === 'startup' ? 'bg-blue-50' : 
            userRole === 'college_admin' ? 'bg-purple-50' : 'bg-green-50'
          }>
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle>
              {userRole === 'startup' ? 'Startup Account' : 
               userRole === 'college_admin' ? 'College Admin Account' : 'Student Account'}
            </AlertTitle>
            <AlertDescription>
              {userRole === 'startup' 
                ? 'You are logged in as a startup and can post and manage projects.'
                : userRole === 'college_admin'
                ? 'You are logged in as a college administrator and can manage student verifications.'
                : 'You are logged in as a student and can apply to projects and join teams.'}
            </AlertDescription>
          </Alert>
          
          {/* Student verification status */}
          {userRole === 'student' && (
            <Alert variant={isVerified ? 'default' : 'destructive'} className={isVerified ? 'bg-green-50' : undefined}>
              {isVerified ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>
                {isVerified ? 'Verified Student' : 'Verification Required'}
              </AlertTitle>
              <AlertDescription>
                {isVerified 
                  ? 'Your student status has been verified. You have full access to all features.'
                  : 'Please verify your college affiliation to unlock all features.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
