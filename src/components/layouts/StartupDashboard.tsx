
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Project, Application } from '@/types/database';
import { AlertCircle, PlusCircle, Briefcase, ClockIcon, MessageSquare, UserRound } from 'lucide-react';

const StartupDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, applications, getUserProjects } = useProject();
  const [startupProjects, setStartupProjects] = useState<Project[]>([]);
  const [projectApplications, setProjectApplications] = useState<Application[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (user) {
      // Get projects created by this startup
      const myProjects = getUserProjects();
      setStartupProjects(myProjects);
      
      // Get all applications for the startup's projects
      const myProjectIds = myProjects.map(p => p.id);
      const projectApps = applications.filter(app => 
        myProjectIds.includes(app.project_id)
      );
      setProjectApplications(projectApps);
      
      // Get pending applications
      const pending = projectApps.filter(app => app.status === 'pending');
      setPendingApplications(pending);
    }
  }, [user, projects, applications, getUserProjects]);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.company_name || profile?.name || 'Startup'}</h1>
        <p className="text-muted-foreground">
          Manage your projects and applications from students
        </p>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{startupProjects.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active projects
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{pendingApplications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Applications awaiting review
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{projectApplications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Applications received
                </p>
              </div>
              <UserRound className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">
                  {startupProjects.filter(p => new Date(p.end_date) > new Date()).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projects with upcoming deadlines
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Projects section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>Projects you have created</CardDescription>
                </div>
                <Button onClick={() => navigate('/create-project')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {startupProjects.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't created any projects yet.
                  </p>
                  <Button onClick={() => navigate('/create-project')}>
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {startupProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{project.title}</h3>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          project.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Applications</span>
                          <span>{applications.filter(app => app.project_id === project.id).length}</span>
                        </div>
                        <Progress 
                          value={applications.filter(app => app.project_id === project.id).length > 0 ? 75 : 25} 
                          className="h-2" 
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          Manage Project
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Recently received applications
                </CardDescription>
              </div>
              {projectApplications.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {projectApplications.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No applications yet.</p>
                <Button onClick={() => navigate('/projects')}>View Projects</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projectApplications.slice(0, 5).map(app => {
                  // Find project name for this application
                  const project = projects.find(p => p.id === app.project_id);
                  
                  return (
                    <div key={app.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">{project?.title || "Unknown Project"}</p>
                        <p className="text-sm text-muted-foreground">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => navigate('/create-project')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <Briefcase className="mr-2 h-4 w-4" />
          View My Projects
        </Button>
      </div>
    </div>
  );
};

export default StartupDashboard;
