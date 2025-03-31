
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Users, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CollegeAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects } = useProject();
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [verifiedStudents, setVerifiedStudents] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get count of pending student verifications
        const { count: pendingCount, error: pendingError } = await supabase
          .from('user_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('college_id', profile?.college || '')
          .eq('is_verified', false);
        
        if (pendingError) throw pendingError;
        
        // Get count of verified students
        const { count: verifiedCount, error: verifiedError } = await supabase
          .from('user_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('college_id', profile?.college || '')
          .eq('is_verified', true);
        
        if (verifiedError) throw verifiedError;
        
        setPendingVerifications(pendingCount || 0);
        setVerifiedStudents(verifiedCount || 0);
        setTotalProjects(projects.length);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [user, profile, projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.name || 'Admin'}</h1>
        <p className="text-muted-foreground">
          Manage your college student verifications and monitor project participation
        </p>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              College Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{verifiedStudents}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verified students from your college
                </p>
              </div>
              <School className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{pendingVerifications}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Students waiting for verification
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{projects.filter(p => p.status === 'open').length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Open projects for students
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{totalProjects}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All projects in the platform
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Verification Section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Student Verifications</CardTitle>
                <CardDescription>Verify students from your college</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {pendingVerifications === 0 ? (
              <div className="text-center py-8 flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                <p className="text-muted-foreground mb-4">
                  All student verifications are complete!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You have {pendingVerifications} student{pendingVerifications !== 1 ? 's' : ''} waiting for verification.
                </p>
                <Button>Verify Students</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* College Projects Section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Project Participation</CardTitle>
                <CardDescription>
                  Monitor student project participation
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                View Projects
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Students</p>
                  <p className="text-sm text-muted-foreground">Students working on projects</p>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(verifiedStudents * 0.65)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Project Completion Rate</p>
                  <p className="text-sm text-muted-foreground">Projects completed successfully</p>
                </div>
                <div className="text-2xl font-bold">
                  78%
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Average Team Size</p>
                  <p className="text-sm text-muted-foreground">Members per team</p>
                </div>
                <div className="text-2xl font-bold">
                  4.2
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/students')}>
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </Button>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Projects
            </Button>
            <Button variant="secondary" onClick={() => navigate('/college-settings')}>
              <School className="mr-2 h-4 w-4" />
              College Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeAdminDashboard;
