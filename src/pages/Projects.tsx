
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project, ProjectCategory, PaymentModel } from "@/types/database";
import { Search, PlusCircle, Clock, Users, Tag } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const Projects = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, fetchProjects, getUserProjects } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "all" | "">("");
  const [paymentModelFilter, setPaymentModelFilter] = useState<PaymentModel | "all" | "">("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // Different filtering logic based on user role
    let projectsToFilter = projects;
    
    // If user is a startup, only show their projects
    if (profile?.role === 'startup') {
      projectsToFilter = getUserProjects();
    }
    
    const filtered = projectsToFilter.filter((project) => {
      const searchMatch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = !categoryFilter || categoryFilter === "all" || project.category === categoryFilter;
      const paymentModelMatch = !paymentModelFilter || paymentModelFilter === "all" || project.payment_model === paymentModelFilter;
      
      return searchMatch && categoryMatch && paymentModelMatch;
    });
    
    setFilteredProjects(filtered);
  }, [projects, searchQuery, categoryFilter, paymentModelFilter, profile, getUserProjects]);

  return (
    <DashboardLayout activeTab="projects">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {profile?.role === "startup" ? "Your Projects" : "Available Projects"}
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === "startup"
                ? "Manage and view your created projects."
                : "Explore projects posted by startups."}
            </p>
          </div>
          {profile?.role === "startup" && (
            <Button onClick={() => navigate("/create-project")} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>

        <div className="mb-6 bg-card rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <div>
              <Select onValueChange={(value) => setCategoryFilter(value as ProjectCategory | "all" | "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web_development">Web Development</SelectItem>
                  <SelectItem value="mobile_app">Mobile Development</SelectItem>
                  <SelectItem value="data_science">Data Science</SelectItem>
                  <SelectItem value="machine_learning">Machine Learning</SelectItem>
                  <SelectItem value="blockchain">Blockchain</SelectItem>
                  <SelectItem value="design">UI/UX Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(value) => setPaymentModelFilter(value as PaymentModel | "all" | "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by payment model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Models</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="stipend">Stipend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {project.category.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(project.end_date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {project.team_size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Payment: {project.payment_model.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'open' ? 'bg-green-100 text-green-800' : 
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    onClick={() => navigate(`/project/${project.id}`)} 
                    className="w-full"
                  >
                    {profile?.role === "startup" ? "Manage Project" : "View Details"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-muted/40 rounded-full p-4 mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {profile?.role === "startup"
                  ? "You haven't created any projects that match your filters."
                  : "No projects match your current search criteria. Try adjusting your filters."}
              </p>
              {profile?.role === "startup" && (
                <Button onClick={() => navigate("/create-project")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
