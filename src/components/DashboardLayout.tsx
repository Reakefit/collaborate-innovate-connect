
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Home, Briefcase, Users, MessageSquare, Settings, PlusCircle, SearchIcon, BookOpen } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab = "dashboard" 
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
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
        // Different project routes based on user role
        if (profile?.role === 'startup') {
          navigate("/projects");
        } else {
          navigate("/projects");
        }
        break;
      case "teams":
        navigate("/teams");
        break;
      case "messages":
        navigate("/messages");
        break;
      case "settings":
        navigate("/profile");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // Define different navigation options based on user role
  const getNavigationOptions = () => {
    if (profile?.role === 'startup') {
      return (
        <TabsList className="h-14 w-full justify-start bg-transparent gap-2 overflow-x-auto">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>

          <TabsTrigger
            value="projects"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
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
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>

          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
      );
    } else {
      // Student navigation
      return (
        <TabsList className="h-14 w-full justify-start bg-transparent gap-2 overflow-x-auto">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>

          <TabsTrigger
            value="projects"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            Find Projects
          </TabsTrigger>

          <TabsTrigger
            value="teams"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <Users className="h-4 w-4 mr-2" />
            My Teams
          </TabsTrigger>

          <TabsTrigger
            value="messages"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>

          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
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
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {getNavigationOptions()}
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
