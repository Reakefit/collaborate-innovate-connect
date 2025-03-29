
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project, ProjectCategory, PaymentModel } from "@/types/database";
import { Search, PlusCircle } from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, fetchProjects } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "all" | "">("");
  const [paymentModelFilter, setPaymentModelFilter] = useState<PaymentModel | "all" | "">("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const searchMatch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = !categoryFilter || categoryFilter === "all" || project.category === categoryFilter;
    const paymentModelMatch = !paymentModelFilter || paymentModelFilter === "all" || project.payment_model === paymentModelFilter;
    
    return searchMatch && categoryMatch && paymentModelMatch;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {profile?.role === "startup" ? "Your Projects" : "Available Projects"}
          </CardTitle>
          <CardDescription>
            {profile?.role === "startup"
              ? "Manage and view your created projects."
              : "Explore projects posted by startups."}
          </CardDescription>
        </CardHeader>
        {profile?.role === "startup" && (
          <Button onClick={() => navigate("/create-project")} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-1 md:col-span-3 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select onValueChange={(value) => setCategoryFilter(value as ProjectCategory | "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web_development">Web Development</SelectItem>
                <SelectItem value="mobile_development">Mobile Development</SelectItem>
                <SelectItem value="data_science">Data Science</SelectItem>
                <SelectItem value="machine_learning">Machine Learning</SelectItem>
                <SelectItem value="ui_ux_design">UI/UX Design</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setPaymentModelFilter(value as PaymentModel | "")}>
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
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
              <CardDescription className="text-gray-500">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-2 py-1 rounded-full bg-gray-100">{project.category}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100">{project.payment_model}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button onClick={() => navigate(`/projects/${project.id}`)}>View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
