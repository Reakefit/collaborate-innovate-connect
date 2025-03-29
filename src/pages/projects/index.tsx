
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { Project, ProjectStatus } from "@/types/database";

type ProjectCategory = 
  | "web_development" 
  | "mobile_development" 
  | "data_science" 
  | "machine_learning" 
  | "ui_ux_design"
  | "devops"
  | "cybersecurity"
  | "blockchain"
  | "other";

type PaymentModel = 
  | "hourly" 
  | "fixed" 
  | "equity" 
  | "unpaid" 
  | "stipend";

const categoryOptions: { value: ProjectCategory; label: string }[] = [
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "data_science", label: "Data Science" },
  { value: "machine_learning", label: "Machine Learning" },
  { value: "ui_ux_design", label: "UI/UX Design" },
  { value: "devops", label: "DevOps" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "blockchain", label: "Blockchain" },
  { value: "other", label: "Other" }
];

const paymentOptions: { value: PaymentModel; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "fixed", label: "Fixed" },
  { value: "equity", label: "Equity" },
  { value: "unpaid", label: "Unpaid" },
  { value: "stipend", label: "Stipend" }
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects } = useProject();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search query, category, and payment model
  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === "" || project.category === selectedCategory;
    
    // Payment filter
    const matchesPayment = selectedPayment === "" || project.payment_model === selectedPayment;
    
    // Tab filter
    const matchesTab = activeTab === "all" || (activeTab === "mine" && project.created_by === user?.id);
    
    return matchesSearch && matchesCategory && matchesPayment && matchesTab;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-500">Find projects to work on or post your own</p>
        </div>
        
        {profile?.role === "startup" && (
          <Button onClick={() => navigate('/create-project')}>
            Create Project
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Payment Models</SelectItem>
                    {paymentOptions.map((payment) => (
                      <SelectItem key={payment.value} value={payment.value}>
                        {payment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "mine")}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="all">All Projects</TabsTrigger>
                    <TabsTrigger value="mine" disabled={!user}>My Projects</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Projects List */}
        {loading ? (
          <div className="text-center py-8">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No projects found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  const navigate = useNavigate();
  
  const getCategoryLabel = (category: string) => {
    const found = categoryOptions.find(c => c.value === category);
    return found ? found.label : category;
  };
  
  const getPaymentLabel = (payment: string) => {
    const found = paymentOptions.find(p => p.value === payment);
    return found ? found.label : payment;
  };
  
  const getStatusVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-2">{project.title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              Posted on {new Date(project.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(project.status)}>
            {project.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-4">{project.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Category:</span>
            <span>{getCategoryLabel(project.category)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Payment:</span>
            <span>{getPaymentLabel(project.payment_model)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Team Size:</span>
            <span>{project.team_size} members</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Duration:</span>
            <span>
              {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectsPage;
