
import React, { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useAuthorization } from "@/context/AuthorizationContext";
import { 
  Home, Briefcase, Users, MessageSquare, Settings, 
  PlusCircle, SearchIcon, BookOpen, School, CheckCircle, User
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab = "dashboard" 
}) => {
  const { user, profile } = useAuth();
  const { userRole } = useAuthorization();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">You need to be logged in</h1>
            <p className="mb-6">Please sign in or create an account to access this page.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/signin")}>Sign In</Button>
              <Button variant="outline" onClick={() => navigate("/signup")}>
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    switch (value) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "projects":
        navigate("/projects");
        break;
      case "teams":
        navigate("/teams");
        break;
      case "messages":
        navigate("/messages");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "students":
        navigate("/students");
        break;
      case "verifications":
        navigate("/verifications");
        break;
      case "college-settings":
        navigate("/college-settings");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // Detect the current active tab based on the route
  const detectActiveTab = () => {
    const path = location.pathname;
    
    if (path.includes("/create-project")) return "create-project";
    if (path.includes("/students")) return "students";
    if (path.includes("/verifications")) return "verifications";
    if (path.includes("/college-settings")) return "college";
    
    if (path.includes("/projects")) return "projects";
    if (path.includes("/teams")) return "teams";
    if (path.includes("/messages")) return "messages";
    if (path.includes("/profile")) return "profile";
    
    return "dashboard";
  };

  // Use the detected active tab if not explicitly provided
  const currentActiveTab = activeTab || detectActiveTab();

  // Get role-specific navigation options
  const renderNavigationOptions = () => {
    switch (userRole) {
      case 'startup':
        return (
          <TabsList className="h-14 w-full justify-start bg-transparent gap-2 overflow-x-auto">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>

            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/projects')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              My Projects
            </TabsTrigger>

            <TabsTrigger
              value="create-project"
              onClick={() => navigate('/create-project')}
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Project
            </TabsTrigger>

            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/messages')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>
        );
        
      case 'college_admin':
        return (
          <TabsList className="h-14 w-full justify-start bg-transparent gap-2 overflow-x-auto">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/students')}
            >
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            
            <TabsTrigger
              value="verifications"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/verifications')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verifications
            </TabsTrigger>
            
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/projects')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Projects
            </TabsTrigger>
            
            <TabsTrigger
              value="college"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/college-settings')}
            >
              <School className="h-4 w-4 mr-2" />
              College Info
            </TabsTrigger>
            
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>
        );
        
      default: // Student navigation
        return (
          <TabsList className="h-14 w-full justify-start bg-transparent gap-2 overflow-x-auto">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>

            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/projects')}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Find Projects
            </TabsTrigger>

            <TabsTrigger
              value="teams"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/teams')}
            >
              <Users className="h-4 w-4 mr-2" />
              My Teams
            </TabsTrigger>

            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/messages')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Dashboard Tabs Navigation */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            value={currentActiveTab}
            className="w-full"
          >
            {renderNavigationOptions()}
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2023 Student-Startup Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
