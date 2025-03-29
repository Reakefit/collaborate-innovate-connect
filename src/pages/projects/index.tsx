
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowRight } from "lucide-react";
import { ProjectCategory, PaymentModel } from "@/types/database";

const Projects = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, loading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");
  const [selectedPaymentModel, setSelectedPaymentModel] = useState<PaymentModel | "all">("all");

  const categories: ProjectCategory[] = [
    "MVP Development",
    "Market Research",
    "GTM Strategy",
    "Design",
    "Content Creation",
    "Social Media",
    "Data Analysis",
    "Other"
  ];

  const paymentModels: PaymentModel[] = [
    "Pro-bono",
    "Stipend",
    "Equity",
    "Certificate"
  ];

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesPayment = selectedPaymentModel === "all" || project.payment_model === selectedPaymentModel;
    return matchesSearch && matchesCategory && matchesPayment;
  }) || [];

  return (
    <DashboardLayout activeTab="projects">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Projects</h1>
              <p className="text-muted-foreground">
                {profile?.role === 'startup' 
                  ? 'Manage your projects and track progress'
                  : 'Browse and apply to exciting projects from startups'
                }
              </p>
            </div>
            {profile?.role === "startup" && (
              <Button onClick={() => navigate("/create-project")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border rounded-md px-3 py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProjectCategory | "all")}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md px-3 py-2"
                value={selectedPaymentModel}
                onChange={(e) => setSelectedPaymentModel(e.target.value as PaymentModel | "all")}
              >
                <option value="all">All Payment Models</option>
                {paymentModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {project.category} • {project.payment_model}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        new Date(project.end_date) > new Date() ? "outline" : "destructive"
                      }>
                        {new Date(project.end_date) > new Date() ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(project.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Search className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery || selectedCategory !== "all" || selectedPaymentModel !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "No projects are available at the moment. Check back later!"}
                </p>
                {profile?.role === "startup" && (
                  <Button onClick={() => navigate("/create-project")}>
                    Create Your First Project
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
