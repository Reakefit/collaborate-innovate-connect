
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Application, Team, Project } from '@/types/database';
import { AlertCircle, BookIcon, ClockIcon, UsersIcon, FileText, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, teams, applications, fetchUserTeams, fetchTeamTasks } = useProject();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);

  useEffect(() => {
    const loadTeamsData = async () => {
      if (user) {
        const myTeams = await fetchUserTeams();
        setUserTeams(myTeams);
        
        // Find projects the student is involved in
        const studentProjects = projects.filter(project => 
          applications.some(app => 
            app.project_id === project.id && 
            app.user_id === user.id && 
            app.status === 'accepted'
          )
        );
        setActiveProjects(studentProjects);
        
        // Get applications submitted by the student
        const studentApplications = applications.filter(app => app.user_id === user.id);
        setUserApplications(studentApplications);
      }
    };
    
    loadTeamsData();
  }, [user, projects, applications, teams, fetchUserTeams]);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.name || 'Student'}</h1>
        <p className="text-muted-foreground">
          Manage your teams, applications, and project work
        </p>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{activeProjects.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projects you're working on
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{userTeams.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Teams you're part of
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{userApplications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Applications submitted
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-amber-500 opacity-80" />
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
                  {activeProjects.filter(p => new Date(p.end_date) > new Date()).length}
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
        {/* Active Projects section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    My Active Projects
                  </CardTitle>
                  <CardDescription>
                    Projects you've been accepted to work on
                  </CardDescription>
                </div>
                {activeProjects.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activeProjects.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You are not working on any projects yet.
                  </p>
                  <Button 
                    onClick={() => navigate('/projects')}
                  >
                    Find Projects
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.slice(0, 3).map((project) => (
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
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Teams section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  My Teams
                </CardTitle>
                <CardDescription>
                  Teams you are a member of
                </CardDescription>
              </div>
              {userTeams.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {userTeams.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You are not part of any teams yet.</p>
                <Button onClick={() => navigate('/teams')}>Create or Join a Team</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userTeams.slice(0, 3).map(team => (
                  <div key={team.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{team.name}</h3>
                      <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                        {team.members?.length || 0} Members
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{team.description}</p>
                    <Button 
                      className="w-full mt-2" 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      View Team
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your project applications and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {userApplications.length > 0 ? (
            <div className="space-y-4">
              {userApplications.slice(0, 5).map((application) => {
                // Find project for this application
                const project = projects.find(p => p.id === application.project_id);
                
                return (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{project?.title || "Unknown Project"}</h3>
                      <p className="text-sm text-muted-foreground">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No applications submitted yet</p>
          )}
        </CardContent>
      </Card>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => navigate('/projects')}>
          <BookIcon className="mr-2 h-4 w-4" />
          Find Projects
        </Button>
        <Button variant="outline" onClick={() => navigate('/teams')}>
          <UsersIcon className="mr-2 h-4 w-4" />
          Manage Teams
        </Button>
      </div>
    </div>
  );
};

export default StudentDashboard;
