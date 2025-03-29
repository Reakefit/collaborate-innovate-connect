
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Project, Application, Team } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, BookIcon, ClockIcon, UsersIcon, PlusCircleIcon, Briefcase, FileText, AlertCircle } from 'lucide-react';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, teams, applications, getUserProjects } = useProject();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (user) {
      // Set user projects
      const myProjects = getUserProjects();
      setUserProjects(myProjects);

      // Set user teams
      const myTeams = teams.filter(team => 
        team.lead_id === user.id || 
        team.members?.some(member => member.user_id === user.id)
      );
      setUserTeams(myTeams);

      // Set user applications
      const myApplications = applications.filter(app => 
        app.user_id === user.id || 
        (app.team_id && myTeams.some(team => team.id === app.team_id))
      );
      setUserApplications(myApplications);
    }
  }, [user, projects, teams, applications, getUserProjects]);

  // Sort projects by start date (newest first)
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.name || 'User'}</h1>
          <p className="text-muted-foreground">
            {profile?.role === 'startup' 
              ? 'Manage your projects and find talented students' 
              : 'Find projects and apply to opportunities'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          {profile?.role === 'startup' ? (
            <Button 
              className="flex items-center gap-2" 
              onClick={() => navigate('/create-project')}
            >
              <PlusCircleIcon className="h-4 w-4" />
              Create New Project
            </Button>
          ) : (
            <Button 
              className="flex items-center gap-2" 
              onClick={() => navigate('/projects')}
            >
              <BookIcon className="h-4 w-4" />
              Browse Projects
            </Button>
          )}
        </div>
      </div>

      {/* Stats overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {profile?.role === 'startup' ? 'My Projects' : 'Active Projects'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{userProjects.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.role === 'startup' 
                    ? 'Projects you created' 
                    : 'Projects you\'re working on'}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {profile?.role === 'startup' ? 'Applications' : 'My Applications'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{userApplications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.role === 'startup' 
                    ? 'Applications received' 
                    : 'Applications submitted'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-amber-500 opacity-80" />
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
                <p className="text-3xl font-bold">{userTeams.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.role === 'startup' 
                    ? 'Teams collaborating with you' 
                    : 'Teams you\'re part of'}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-green-500 opacity-80" />
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
                  {userProjects.filter(p => new Date(p.end_date) > new Date()).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projects with upcoming deadlines
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects section */}
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {profile?.role === 'startup' ? 'Your Projects' : 'Projects You\'re Working On'}
                </CardTitle>
                <CardDescription>
                  {profile?.role === 'startup' 
                    ? 'Projects you have created' 
                    : 'Projects you have been accepted to work on'}
                </CardDescription>
              </div>
              {userProjects.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => 
                  profile?.role === 'startup' ? navigate('/projects') : navigate('/projects')
                }>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {userProjects.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {profile?.role === 'startup' 
                    ? 'You haven\'t created any projects yet.' 
                    : 'You are not working on any projects yet.'}
                </p>
                <Button 
                  onClick={() => profile?.role === 'startup' 
                    ? navigate('/create-project') 
                    : navigate('/projects')
                  }
                >
                  {profile?.role === 'startup' ? 'Create Project' : 'Browse Projects'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProjects.slice(0, 3).map((project) => (
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
                        onClick={() => navigate(`/projects/${project.id}`)}
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

        {/* Teams or applications section */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {profile?.role === 'startup' ? 'Applications' : 'Your Teams'}
                </CardTitle>
                <CardDescription>
                  {profile?.role === 'startup' 
                    ? 'Recent applications to your projects' 
                    : 'Teams you are a member of'}
                </CardDescription>
              </div>
              {(profile?.role === 'startup' ? applications.length > 0 : userTeams.length > 0) && (
                <Button variant="outline" size="sm" onClick={() => 
                  profile?.role === 'startup' ? navigate('/applications') : navigate('/teams')
                }>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {profile?.role === 'startup' ? (
              applications.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No applications yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">{app.team?.name || 'Individual Application'}</p>
                        <p className="text-sm text-muted-foreground">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/applications/${app.id}`)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              userTeams.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You are not part of any teams yet.</p>
                  <Button onClick={() => navigate('/teams')}>Create a Team</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTeams.map(team => (
                    <div key={team.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{team.name}</h3>
                        <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                          {team.members?.length || 0} Member{team.members?.length !== 1 ? 's' : ''}
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
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
