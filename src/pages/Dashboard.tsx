
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProjects, Project, ProjectApplication } from "@/context/ProjectContext";
import { Briefcase, Clock, CheckCircle, Users, ArrowRight, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { projects, userApplications, getUserProjects } = useProjects();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingApplications: 0,
    completedProjects: 0,
    teamInvitations: 0,
  });

  const userProjects = getUserProjects();
  
  useEffect(() => {
    if (user) {
      // Calculate stats based on user role
      if (user.role === "startup") {
        const startupProjects = projects.filter(p => p.createdBy.id === user.id);
        
        setStats({
          activeProjects: startupProjects.filter(p => p.status === "in-progress").length,
          pendingApplications: startupProjects.reduce(
            (acc, project) => acc + project.applications.filter(a => a.status === "pending").length, 
            0
          ),
          completedProjects: startupProjects.filter(p => p.status === "completed").length,
          teamInvitations: 0, // Not applicable for startups
        });
      } else {
        // For students
        setStats({
          activeProjects: userProjects.filter(p => p.status === "in-progress").length,
          pendingApplications: userApplications.filter(a => a.status === "pending").length,
          completedProjects: userProjects.filter(p => p.status === "completed").length,
          teamInvitations: 0, // Would be implemented in a real app
        });
      }
    }
  }, [user, projects, userApplications, userProjects]);

  // Get recent projects
  const recentProjects = userProjects.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name}! Here's what's happening with your projects.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                Projects currently in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                {user?.role === "startup" ? "Applications to review" : "Waiting for response"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished projects
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === "startup" ? "Available Students" : "Team Invitations"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.role === "startup" ? "500+" : stats.teamInvitations}
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.role === "startup" ? "Students on platform" : "Pending team invites"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {user?.role === "startup" ? (
            <Button onClick={() => navigate("/create-project")}>
              Create New Project
            </Button>
          ) : (
            <Button onClick={() => navigate("/projects")}>
              Find Projects
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(user?.role === "startup" ? "/projects" : "/teams")}>
            {user?.role === "startup" ? "View My Projects" : "Manage Teams"}
          </Button>
        </div>

        {/* Recent Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {project.category} • {project.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(project.timeline.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/project/${project.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  {user?.role === "startup" ? 
                    "You haven't created any projects yet. Create your first project to get started!" :
                    "You haven't applied to any projects yet. Browse available projects to get started!"
                  }
                </p>
                <Button onClick={() => navigate(user?.role === "startup" ? "/create-project" : "/projects")}>
                  {user?.role === "startup" ? "Create Project" : "Find Projects"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
