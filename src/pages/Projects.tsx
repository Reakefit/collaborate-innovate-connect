
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, Briefcase, Clock, CalendarIcon, Users, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Project } from '@/types/database';
import { format } from 'date-fns';

const Projects = () => {
  const { projects, loading, fetchProjects } = useProject();
  const { user } = useAuth();
  const { userRole } = useAuthorization();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState(userRole === 'startup' ? 'my-projects' : 'all-projects');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // Filter projects based on user role and search term
    let filtered = [...projects];
    
    // Apply role-based filters
    if (userRole === 'startup' && activeTab === 'my-projects') {
      // Show only projects created by the logged-in startup
      filtered = filtered.filter(project => project.created_by === user?.id);
    }
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(term) || 
        project.description.toLowerCase().includes(term) ||
        (project.required_skills && project.required_skills.some(skill => 
          skill.toLowerCase().includes(term)
        ))
      );
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm, userRole, user, activeTab]);

  return (
    <DashboardLayout activeTab="projects">
      <div className="space-y-6">
        {/* Page header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {userRole === 'startup' ? 'My Projects' : 'Find Projects'}
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'startup' 
                ? 'Manage your projects and track applications'
                : 'Discover project opportunities and apply to work with startups'}
            </p>
          </div>
          
          {userRole === 'startup' && (
            <Button onClick={() => navigate('/create-project')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>

        {/* Search input */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title, description, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Project tabs and listing */}
        {userRole === 'startup' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="all-projects">All Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-projects" className="space-y-4">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-10">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No projects found</h3>
                  <p className="mt-1 text-muted-foreground">
                    You haven't created any projects yet. Create your first project to get started.
                  </p>
                  <Button onClick={() => navigate('/create-project')} className="mt-4">
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      userRole={userRole}
                      onClick={() => navigate(`/project/${project.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all-projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.length === 0 ? (
                  <div className="col-span-3 text-center py-10">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No projects found</h3>
                    <p className="mt-1 text-muted-foreground">
                      Try adjusting your search to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  filteredProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      userRole={userRole}
                      onClick={() => navigate(`/project/${project.id}`)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Student view - always shows all available projects
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No projects found</h3>
                <p className="mt-1 text-muted-foreground">
                  Try adjusting your search to find what you're looking for.
                </p>
              </div>
            ) : (
              filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  userRole={userRole}
                  onClick={() => navigate(`/project/${project.id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

interface ProjectCardProps {
  project: Project;
  userRole: string | null;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, userRole, onClick }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{project.title}</CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>Team Size: {project.team_size}</span>
          </div>
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.required_skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-muted/50">
                  {skill}
                </Badge>
              ))}
              {project.required_skills.length > 3 && (
                <Badge variant="outline" className="bg-muted/50">
                  +{project.required_skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {userRole === 'startup' && project.created_by === user?.id ? 'Manage Project' : 'View Details'}
        </Button>
      </CardFooter>
    </Card>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    return 'No date';
  }
}

export default Projects;
