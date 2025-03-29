
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, ProjectStatus } from '@/types/database';
import { Calendar, Clock, DollarSign, Filter, Search, Users } from 'lucide-react';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const Projects = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading } = useProject();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectType, setProjectType] = useState('all');

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, categoryFilter, statusFilter, projectType]);

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Filter by project type (owned or all)
    if (profile && projectType === 'owned') {
      filtered = filtered.filter(project => project.created_by === profile.id);
    }

    setFilteredProjects(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web_development', label: 'Web Development' },
    { value: 'mobile_development', label: 'Mobile Development' },
    { value: 'data_science', label: 'Data Science' },
    { value: 'machine_learning', label: 'Machine Learning' },
    { value: 'ui_ux_design', label: 'UI/UX Design' },
    { value: 'devops', label: 'DevOps' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const projectTypes = [
    { value: 'all', label: 'All Projects' },
    { value: 'owned', label: 'My Projects' }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Browse all available projects or create your own.
          </p>
        </div>
        
        {profile?.role === 'startup' && (
          <Button onClick={handleCreateProject} className="mt-4 md:mt-0">
            Create Project
          </Button>
        )}
      </div>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <Card key={project.id} className="overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl line-clamp-2">{project.title}</CardTitle>
                  <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-2 flex-grow">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Start: {formatDate(project.start_date)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>End: {formatDate(project.end_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="capitalize">{project.payment_model} Payment</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{project.team_size} Team Member{project.team_size > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 pt-2">
                    {project.required_skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {project.required_skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.required_skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewProject(project.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 flex flex-col items-center justify-center text-center">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any projects matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
