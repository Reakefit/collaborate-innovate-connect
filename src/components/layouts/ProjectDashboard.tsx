import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Search, LayoutDashboard, Briefcase, Users, MessageSquare, CheckSquare, Settings } from 'lucide-react';

interface ProjectDashboardProps {
  children: React.ReactNode;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects } = useProjects();

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/projects"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
          >
            <Briefcase className="h-5 w-5" />
            <span>Projects</span>
          </Link>
          <Link
            to="/teams"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
          >
            <Users className="h-5 w-5" />
            <span>Teams</span>
          </Link>
          <Link
            to="/messages"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </Link>
          <Link
            to="/tasks"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
          >
            <CheckSquare className="h-5 w-5" />
            <span>Tasks</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b flex items-center px-6">
          <div className="flex-1 flex items-center space-x-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard; 