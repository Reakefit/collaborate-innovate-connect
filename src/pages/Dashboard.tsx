import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { Briefcase, Clock, CheckCircle, Users, ArrowRight, AlertCircle, Plus, Search, FileText, MessageSquare, Calendar } from "lucide-react";
import { Project, Application, Team } from "@/types/database";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { projects, teams, applications, loading } = useProject();
  const navigate = useNavigate();
  
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (profile?.role === "startup") {
      setUserProjects(projects.filter(p => p.created_by === user.id));
    } else {
      setUserProjects(projects.filter(p => 
        applications.some(a => a.team?.members?.some(m => m.user_id === user.id) && a.status === 'accepted')
      ));
    }

    setUserApplications(applications.filter(a => 
      a.team?.members?.some(m => m.user_id === user.id)
    ));

    setUserTeams(teams.filter(team => 
      team.members?.some(member => member.user_id === user.id)
    ));
  }, [user, profile, projects, applications, teams, navigate]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {profile?.name}! Here's what's happening with your projects.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  Projects currently in progress
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userTeams.length}</div>
                <p className="text-xs text-muted-foreground">
                  Teams you're part of
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userApplications.length}</div>
                <p className="text-xs text-muted-foreground">
                  Applications you've submitted
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProjects.filter(p => new Date(p.end_date) > new Date()).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projects with upcoming deadlines
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {profile?.role === "startup" ? (
              <Button onClick={() => navigate("/projects/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            ) : (
              <Button onClick={() => navigate("/projects")}>
                <Search className="mr-2 h-4 w-4" />
                Find Projects
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(profile?.role === "startup" ? "/projects" : "/teams")}>
              {profile?.role === "startup" ? "View My Projects" : "Manage Teams"}
            </Button>
          </div>

          {/* Recent Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Projects</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {userProjects.length > 0 ? (
              <div className="space-y-4">
                {userProjects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(project.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-none shadow-lg bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    {profile?.role === "startup" ? 
                      "You haven't created any projects yet. Create your first project to get started!" :
                      "You haven't applied to any projects yet. Browse available projects to get started!"
                    }
                  </p>
                  <Button onClick={() => navigate(profile?.role === "startup" ? "/projects/new" : "/projects")}>
                    {profile?.role === "startup" ? "Create Project" : "Find Projects"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {userApplications.length > 0 ? (
                  <div className="space-y-4">
                    {userApplications.slice(0, 5).map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{application.project?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {application.team?.name}
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
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No applications yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
