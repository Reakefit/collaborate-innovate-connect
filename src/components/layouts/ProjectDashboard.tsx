
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';

const ProjectDashboard = () => {
  const { projects, teams, applications, loading } = useProjects();
  const { user, profile } = useAuth();

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

  return (
    <div className="py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Project Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProjects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userTeams.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {userProjects.length > 0 ? (
                <div className="space-y-4">
                  {userProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{project.status}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No projects found</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Teams</CardTitle>
            </CardHeader>
            <CardContent>
              {userTeams.length > 0 ? (
                <div className="space-y-4">
                  {userTeams.slice(0, 5).map(team => (
                    <div key={team.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.members?.length || 0} member(s)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No teams found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
