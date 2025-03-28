
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useProjects, Team } from "@/context/ProjectContext";
import { AlertCircle, Users } from "lucide-react";

const Teams = () => {
  const { user } = useAuth();
  const { teams, projects } = useProjects();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  
  useEffect(() => {
    // Filter teams that the user is a part of
    if (user) {
      const filteredTeams = teams.filter(team => 
        team.members.some(member => member.id === user.id)
      );
      setUserTeams(filteredTeams);
    }
  }, [user, teams]);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const getProjectsForTeam = (teamId: string) => {
    return projects.filter(project => project.selectedTeam === teamId);
  };
  
  return (
    <DashboardLayout activeTab="teams">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and collaborations
          </p>
        </div>
        
        {userTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTeams.map((team) => {
              const teamProjects = getProjectsForTeam(team.id);
              const activeProjects = teamProjects.filter(p => p.status === "in-progress");
              
              return (
                <Card key={team.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{team.name}</CardTitle>
                      {team.leadId === user?.id && (
                        <Badge>Team Lead</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {team.members.length} members • {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Team Members</h3>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${member.id === team.leadId ? 'bg-primary' : 'bg-muted'} ${member.id === team.leadId ? 'text-primary-foreground' : ''}`}>
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{member.name}</div>
                              {member.id === team.leadId && (
                                <div className="text-xs text-muted-foreground">Lead</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {teamProjects.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Projects</h3>
                        <div className="space-y-2">
                          {teamProjects.map((project) => (
                            <div key={project.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                              <div>
                                <div className="font-medium">{project.title}</div>
                                <div className="text-xs text-muted-foreground">{project.status}</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.location.href = `/project/${project.id}`}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Team Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Users className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                You haven't formed or joined any teams yet. Apply to projects as a team to get started with collaboration.
              </p>
              <Button onClick={() => window.location.href = '/projects'}>
                Browse Projects
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Teams;
