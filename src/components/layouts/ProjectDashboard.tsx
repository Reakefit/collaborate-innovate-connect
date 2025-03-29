
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Briefcase, CheckCircle, Clock, Users } from 'lucide-react';

const ProjectDashboard = () => {
  const { projects, teams, applications, loading } = useProjects();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter projects based on user role
  const userProjects = profile?.role === "startup" 
    ? projects.filter(p => p.created_by === user?.id)
    : projects;

  // Get teams user is part of
  const userTeams = teams.filter(team => 
    team.members?.some(member => member.user_id === user?.id)
  );

  // Get user applications
  const userApplications = applications.filter(app => 
    app.user_id === user?.id || 
    app.team?.members?.some(member => member.user_id === user?.id)
  );

  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {profile?.role === "startup" && (
            <Button onClick={() => navigate("/create-project")}>
              Create New Project
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">{profile?.role === "startup" ? userProjects.length : userApplications.length}</div>
                <div className="text-xs text-muted-foreground">
                  {profile?.role === "startup" ? 'Created' : 'Applied'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">{userTeams.length}</div>
                <div className="text-xs text-muted-foreground">
                  {profile?.role === "startup" ? 'Collaborating' : 'Joined'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {profile?.role === "startup" ? 'Applications' : 'Accepted Projects'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">
                  {profile?.role === "startup" 
                    ? applications.filter(app => 
                        userProjects.some(p => p.id === app.project_id)
                      ).length 
                    : userApplications.filter(app => app.status === "accepted").length
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile?.role === "startup" ? 'Received' : 'Active'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>
                {profile?.role === "startup" ? "My Projects" : "Recent Projects"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {userProjects.length > 0 ? (
                <div className="space-y-4">
                  {userProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="flex items-center justify-between border-b pb-3 cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{project.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={
                              new Date(project.end_date) > new Date() ? "default" : "destructive"
                            }>
                              {project.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Due: {new Date(project.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {profile?.role === "startup" 
                      ? "You haven't created any projects yet" 
                      : "No projects available right now"
                    }
                  </p>
                  <Button onClick={() => navigate(profile?.role === "startup" ? "/create-project" : "/projects")}>
                    {profile?.role === "startup" ? "Create Your First Project" : "Browse Projects"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Teams Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>My Teams</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/teams")}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {userTeams.length > 0 ? (
                <div className="space-y-4">
                  {userTeams.slice(0, 5).map(team => (
                    <div key={team.id} className="flex items-center justify-between border-b pb-3 cursor-pointer" onClick={() => navigate(`/teams/${team.id}`)}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You are not part of any team yet
                  </p>
                  <Button onClick={() => navigate("/teams")}>
                    {profile?.role === "student" ? "Find or Create a Team" : "View Available Teams"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Applications or Tasks Section based on role */}
          {profile?.role === "startup" ? (
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.filter(app => 
                  userProjects.some(p => p.id === app.project_id)
                ).length > 0 ? (
                  <div className="space-y-4">
                    {applications
                      .filter(app => userProjects.some(p => p.id === app.project_id))
                      .slice(0, 5)
                      .map(app => (
                        <div key={app.id} className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {app.team?.name || 'Individual Applicant'}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant={
                                  app.status === 'accepted' ? 'default' :
                                  app.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }>
                                  {app.status}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Applied to: {userProjects.find(p => p.id === app.project_id)?.title}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/project/${app.project_id}`)}
                          >
                            View Project <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No applications received yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {userApplications.length > 0 ? (
                  <div className="space-y-4">
                    {userApplications.slice(0, 5).map(app => (
                      <div key={app.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            {app.status === 'accepted' ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <Clock className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {projects.find(p => p.id === app.project_id)?.title}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={
                                app.status === 'accepted' ? 'default' :
                                app.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }>
                                {app.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                Applied: {new Date(app.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/project/${app.project_id}`)}
                        >
                          View Project <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't applied to any projects yet
                    </p>
                    <Button onClick={() => navigate("/projects")}>
                      Browse Available Projects
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
