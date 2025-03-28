
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useProjects, Project, ProjectCategory, PaymentModel } from "@/context/ProjectContext";
import { Search, Plus, Briefcase, Clock, AlertCircle } from "lucide-react";

const Projects = () => {
  const { user } = useAuth();
  const { projects, getUserProjects } = useProjects();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [tabValue, setTabValue] = useState("all"); // "all", "open", "in-progress", "completed"
  
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
  const userProjects = getUserProjects();
  
  // Apply filters and search
  useEffect(() => {
    let filtered: Project[];
    
    // First filter by tab (status)
    if (user?.role === "startup") {
      // For startups, only show their own projects
      filtered = userProjects;
    } else {
      // For students, show all projects but filter by status tabs
      filtered = tabValue === "all" 
        ? projects 
        : projects.filter(p => p.status === tabValue);
    }
    
    // Then filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Then filter by category
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Then filter by payment model
    if (paymentFilter && paymentFilter !== "all") {
      filtered = filtered.filter(p => p.paymentModel === paymentFilter);
    }
    
    setFilteredProjects(filtered);
  }, [projects, userProjects, searchTerm, categoryFilter, paymentFilter, tabValue, user]);
  
  return (
    <DashboardLayout activeTab="projects">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.role === "startup" ? "My Projects" : "Find Projects"}
            </h1>
            <p className="text-muted-foreground">
              {user?.role === "startup" 
                ? "Manage and view all your posted projects" 
                : "Browse and apply to available projects from startups"}
            </p>
          </div>
          
          {user?.role === "startup" && (
            <Button onClick={() => navigate("/create-project")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
        
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects, skills, or keywords..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="MVP Development">MVP Development</SelectItem>
                <SelectItem value="Market Research">Market Research</SelectItem>
                <SelectItem value="GTM Strategy">GTM Strategy</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Content Creation">Content Creation</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Types</SelectItem>
                <SelectItem value="Pro-bono">Pro-bono</SelectItem>
                <SelectItem value="Stipend">Stipend</SelectItem>
                <SelectItem value="Equity">Equity</SelectItem>
                <SelectItem value="Certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {user?.role === "student" && (
          <Tabs defaultValue="all" value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {/* Projects List */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1 text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Posted by {project.createdBy.companyName || project.createdBy.name}
                      </CardDescription>
                    </div>
                    <Badge className={
                      project.status === "open" ? "bg-green-500" :
                      project.status === "in-progress" ? "bg-blue-500" :
                      project.status === "completed" ? "bg-gray-500" :
                      "bg-red-500"
                    }>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{project.category}</Badge>
                    <Badge variant="outline">{project.paymentModel}</Badge>
                  </div>
                  
                  <p className="text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.requiredSkills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {skill}
                      </Badge>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        +{project.requiredSkills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>Team of {project.teamSize}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Due {new Date(project.timeline.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {project.applications.length} application{project.applications.length !== 1 ? 's' : ''}
                  </div>
                  <Button 
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {user?.role === "startup" ? 
                  "You haven't created any projects yet. Create your first project to get started!" :
                  "No projects match your current filters. Try adjusting your search criteria."
                }
              </p>
              {user?.role === "startup" ? (
                <Button onClick={() => navigate("/create-project")}>
                  Create Project
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setPaymentFilter("all");
                    setTabValue("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
