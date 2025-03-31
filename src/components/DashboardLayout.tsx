
import React, { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAuthorization } from "@/context/AuthorizationContext";
import { 
  Home, Briefcase, Users, MessageSquare, Settings, 
  PlusCircle, SearchIcon, BookOpen, School, CheckCircle, User,
  BarChart, HelpCircle, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab = "dashboard" 
}) => {
  const { user, profile, signOut } = useAuth();
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

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: "Dashboard",
        icon: <Home className="h-5 w-5" />,
        path: "/dashboard",
        value: "dashboard"
      }
    ];

    // Role-specific menu items
    if (userRole === 'student') {
      return [
        ...baseItems,
        {
          name: "Find Projects",
          icon: <SearchIcon className="h-5 w-5" />,
          path: "/projects",
          value: "projects"
        },
        {
          name: "My Teams",
          icon: <Users className="h-5 w-5" />,
          path: "/teams",
          value: "teams"
        },
        {
          name: "Messages",
          icon: <MessageSquare className="h-5 w-5" />,
          path: "/messages",
          value: "messages"
        }
      ];
    } else if (userRole === 'startup') {
      return [
        ...baseItems,
        {
          name: "My Projects",
          icon: <Briefcase className="h-5 w-5" />,
          path: "/projects",
          value: "projects"
        },
        {
          name: "Create Project",
          icon: <PlusCircle className="h-5 w-5" />,
          path: "/create-project",
          value: "create-project"
        },
        {
          name: "Messages",
          icon: <MessageSquare className="h-5 w-5" />,
          path: "/messages",
          value: "messages"
        }
      ];
    } else if (userRole === 'college_admin') {
      return [
        ...baseItems,
        {
          name: "Students",
          icon: <Users className="h-5 w-5" />,
          path: "/students",
          value: "students"
        },
        {
          name: "Verifications",
          icon: <CheckCircle className="h-5 w-5" />,
          path: "/verifications",
          value: "verifications"
        },
        {
          name: "Projects",
          icon: <BookOpen className="h-5 w-5" />,
          path: "/projects",
          value: "projects"
        },
        {
          name: "College Info",
          icon: <School className="h-5 w-5" />,
          path: "/college-settings",
          value: "college"
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const accountItems = [
    {
      name: "Profile",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
      value: "profile"
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      value: "settings"
    },
    {
      name: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/support",
      value: "support"
    }
  ];

  // Extra items for college admin
  const collegeAdminItems = userRole === 'college_admin' ? [
    {
      name: "Club Members",
      icon: <Users className="h-5 w-5" />,
      path: "/members",
      value: "members"
    },
    {
      name: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      path: "/analytics",
      value: "analytics"
    }
  ] : [];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="bg-white border-r w-64 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">S-S Connect</h1>
          <p className="text-sm text-muted-foreground">Student-Startup Platform</p>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-2">
            <p className="px-2 py-2 text-xs uppercase text-muted-foreground font-medium">Main</p>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-10",
                    currentActiveTab === item.value && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              ))}
            </nav>
          </div>

          {collegeAdminItems.length > 0 && (
            <div className="p-2 mt-4">
              <p className="px-2 py-2 text-xs uppercase text-muted-foreground font-medium">Club Management</p>
              <nav className="space-y-1">
                {collegeAdminItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10",
                      currentActiveTab === item.value && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Button>
                ))}
              </nav>
            </div>
          )}

          <div className="p-2 mt-4">
            <p className="px-2 py-2 text-xs uppercase text-muted-foreground font-medium">Account</p>
            <nav className="space-y-1">
              {accountItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-10",
                    currentActiveTab === item.value && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Sign Out</span>
              </Button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
            {profile?.name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userRole === 'college_admin' ? 'Club Admin' : 
               userRole === 'startup' ? 'Startup' : 'Student'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden">
        <Header />
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 lg:hidden">
        <div className="flex justify-around p-2">
          {navigationItems.slice(0, 4).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col h-16 px-2",
                currentActiveTab === item.value && "text-primary"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col h-16 px-2",
              currentActiveTab === "profile" && "text-primary"
            )}
            onClick={() => navigate("/profile")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
