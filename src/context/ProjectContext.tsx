
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { 
  Project, Application, Team, TeamTask, TeamMember, ProjectMilestone, 
  MilestoneStatus, TaskStatus, ProjectTask, ApplicationStatus, TeamTaskStatus
} from '@/types/database';
import { toast } from 'sonner';
import { fetchApplicationsWithTeams } from '@/services/database';

interface ProjectContextType {
  projects: Project[];
  applications: Application[];
  teams: Team[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  getUserProjects: () => Project[];
  getUserApplications: () => Application[];
  getUserTeams: () => Team[];
  createProject: (projectData: Partial<Project>) => Promise<string | null>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  submitApplication: (projectId: string, message: string) => Promise<boolean>;
  updateApplication: (applicationId: string, status: ApplicationStatus) => Promise<boolean>;
  createTeam: (teamData: Partial<Team>) => Promise<string | null>;
  updateTeam: (teamId: string, teamData: Partial<Team>) => Promise<boolean>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  joinTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  addTeamMember: (teamId: string, userId: string, role: string) => Promise<boolean>;
  removeTeamMember: (teamId: string, userId: string) => Promise<boolean>;
  createTeamTask: (teamId: string, taskData: Partial<TeamTask>) => Promise<string | null>;
  updateTeamTask: (taskId: string, taskData: Partial<TeamTask>) => Promise<boolean>;
  deleteTeamTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  // Add missing methods needed by ProjectDetail and ProjectPage
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<boolean>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<boolean>;
  fetchProject: (projectId: string) => Promise<Project | null>;
  addTask: (projectId: string, milestoneId: string, taskData: Partial<ProjectTask>) => Promise<string | null>;
  addMilestone: (projectId: string, milestoneData: Partial<ProjectMilestone>) => Promise<string | null>;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  applications: [],
  teams: [],
  loading: false,
  error: null,
  fetchProjects: async () => {},
  fetchApplications: async () => {},
  fetchTeams: async () => {},
  getUserProjects: () => [],
  getUserApplications: () => [],
  getUserTeams: () => [],
  createProject: async () => null,
  updateProject: async () => false,
  deleteProject: async () => false,
  submitApplication: async () => false,
  updateApplication: async () => false,
  createTeam: async () => null,
  updateTeam: async () => false,
  deleteTeam: async () => false,
  joinTeam: async () => false,
  leaveTeam: async () => false,
  addTeamMember: async () => false,
  removeTeamMember: async () => false,
  createTeamTask: async () => null,
  updateTeamTask: async () => false,
  deleteTeamTask: async () => false,
  updateTaskStatus: async () => false,
  // Add implementations for missing methods
  applyToProject: async () => false,
  updateApplicationStatus: async () => false,
  fetchProject: async () => null,
  addTask: async () => null,
  addMilestone: async () => null,
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchApplications();
      fetchTeams();
    }
  }, [user]);

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Create properly typed project objects
      const formattedProjects: Project[] = (data || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        created_by: project.created_by,
        category: project.category,
        required_skills: project.required_skills || [],
        start_date: project.start_date,
        end_date: project.end_date,
        team_size: project.team_size,
        payment_model: project.payment_model,
        stipend_amount: project.stipend_amount?.toString() || null,
        equity_percentage: project.equity_percentage?.toString() || null,
        hourly_rate: project.hourly_rate?.toString() || null,
        fixed_amount: project.fixed_amount?.toString() || null,
        deliverables: project.deliverables || [],
        created_at: project.created_at,
        selected_team: project.selected_team || null,
        status: project.status || 'open'
      }));
      
      setProjects(formattedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single project by ID
  const fetchProject = async (projectId: string): Promise<Project | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones:project_milestones(
            *,
            tasks:project_tasks(*)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      // Create a properly typed project object
      const formattedProject: Project = {
        id: data.id,
        title: data.title,
        description: data.description,
        created_by: data.created_by,
        category: data.category,
        required_skills: data.required_skills || [],
        start_date: data.start_date,
        end_date: data.end_date,
        team_size: data.team_size,
        payment_model: data.payment_model,
        stipend_amount: data.stipend_amount?.toString() || null,
        equity_percentage: data.equity_percentage?.toString() || null,
        hourly_rate: data.hourly_rate?.toString() || null,
        fixed_amount: data.fixed_amount?.toString() || null,
        deliverables: data.deliverables || [],
        created_at: data.created_at,
        selected_team: data.selected_team || null,
        status: data.status || 'open',
        milestones: data.milestones
      };
      
      return formattedProject;
    } catch (error: any) {
      console.error('Error fetching project:', error.message);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all applications for the current user
  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get projects created by the user
      const userProjectIds = getUserProjects().map(p => p.id);
      
      // Fetch applications for user projects
      let applications: Application[] = [];
      
      if (userProjectIds.length > 0) {
        for (const projectId of userProjectIds) {
          const projectApplications = await fetchApplicationsWithTeams(projectId);
          applications = [...applications, ...projectApplications];
        }
      }
      
      // Fetch applications submitted by the user
      const { data: userApplications, error: userAppsError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (userAppsError) throw userAppsError;
      
      if (userApplications) {
        // Merge and deduplicate applications
        const allApplications = [...applications, ...(userApplications as Application[])];
        const uniqueApps = Array.from(new Map(allApplications.map(app => [app.id, app])).values());
        setApplications(uniqueApps);
      } else {
        setApplications(applications);
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            user:profiles(id, name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the teams to ensure members is always an array
      // and add the name property from user to each member
      const processedTeams = (data || []).map(team => ({
        ...team,
        members: (team.members || []).map(member => ({
          ...member,
          name: member.user?.name || 'Unknown User'
        })),
      })) as Team[];

      setTeams(processedTeams);
    } catch (error: any) {
      console.error('Error fetching teams:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get projects created by the current user
  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(project => project.created_by === user.id);
  };

  // Get applications submitted by the current user
  const getUserApplications = () => {
    if (!user) return [];
    return applications.filter(application => application.user_id === user.id);
  };

  // Get teams the current user is a member of
  const getUserTeams = () => {
    if (!user) return [];
    return teams.filter(team => 
      team.lead_id === user.id || 
      team.members?.some(member => member.user_id === user.id)
    );
  };

  // Create a new project
  const createProject = async (projectData: Partial<Project>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Make sure required fields have values
      if (!projectData.category || !projectData.description || !projectData.title || 
          !projectData.start_date || !projectData.end_date || !projectData.payment_model) {
        toast.error('Missing required project information');
        return null;
      }
      
      // Convert string number fields to actual numbers for database
      const dataToInsert = {
        ...projectData,
        created_by: user.id,
        stipend_amount: projectData.stipend_amount ? projectData.stipend_amount : null,
        equity_percentage: projectData.equity_percentage ? projectData.equity_percentage : null,
        hourly_rate: projectData.hourly_rate ? projectData.hourly_rate : null,
        fixed_amount: projectData.fixed_amount ? projectData.fixed_amount : null,
        created_at: new Date().toISOString(),
        status: projectData.status || 'open'
      };
      
      // Remove fields that shouldn't be sent to Supabase
      const { updated_at, applications, milestones, ...cleanData } = dataToInsert as any;
      
      const { data, error } = await supabase
        .from('projects')
        .insert(cleanData)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Create a properly typed project object
        const newProject: Project = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          created_by: data[0].created_by,
          category: data[0].category,
          required_skills: data[0].required_skills || [],
          start_date: data[0].start_date,
          end_date: data[0].end_date,
          team_size: data[0].team_size,
          payment_model: data[0].payment_model,
          stipend_amount: data[0].stipend_amount?.toString() || null,
          equity_percentage: data[0].equity_percentage?.toString() || null,
          hourly_rate: data[0].hourly_rate?.toString() || null,
          fixed_amount: data[0].fixed_amount?.toString() || null,
          deliverables: data[0].deliverables || [],
          created_at: data[0].created_at,
          selected_team: data[0].selected_team || null,
          status: data[0].status || 'open'
        };
        
        // Add the new project to the state
        setProjects(prev => [newProject, ...prev]);
        toast.success('Project created successfully!');
        return data[0].id;
      }
      return null;
    } catch (error: any) {
      toast.error(`Error creating project: ${error.message}`);
      return null;
    }
  };

  // Update an existing project
  const updateProject = async (projectId: string, projectData: Partial<Project>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Remove updated_at from the projectData since it's not in the Supabase schema
      const { updated_at, ...dataToUpdate } = projectData as any;
      
      const { error } = await supabase
        .from('projects')
        .update(dataToUpdate)
        .eq('id', projectId)
        .eq('created_by', user.id); // Ensure user owns the project

      if (error) throw error;
      
      // Update the project in the state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, ...projectData } : project
        )
      );
      
      toast.success('Project updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error updating project: ${error.message}`);
      return false;
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('created_by', user.id); // Ensure user owns the project

      if (error) throw error;
      
      // Remove the project from the state
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      toast.success('Project deleted successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error deleting project: ${error.message}`);
      return false;
    }
  };

  // Submit an application to a project
  const submitApplication = async (projectId: string, message: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user already applied to this project
      const existingApplication = applications.find(
        app => app.project_id === projectId && app.user_id === user.id
      );
      
      if (existingApplication) {
        toast.error('You have already applied to this project');
        return false;
      }
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          user_id: user.id,
          cover_letter: message,
          status: 'pending' as ApplicationStatus,
          created_at: new Date().toISOString(),
          team_id: '' // Required field in database
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new application to the state
        setApplications(prev => [data[0] as Application, ...prev]);
        toast.success('Application submitted successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(`Error submitting application: ${error.message}`);
      return false;
    }
  };

  // Update an application
  const updateApplication = async (
    applicationId: string, 
    status: ApplicationStatus
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          // No updated_at here
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      // Update the application in the state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      toast.success(`Application ${status} successfully!`);
      return true;
    } catch (error: any) {
      toast.error(`Error updating application: ${error.message}`);
      return false;
    }
  };

  // Create a new team
  const createTeam = async (teamData: Partial<Team>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Ensure name is provided as it's required
      if (!teamData.name) {
        toast.error('Team name is required');
        return null;
      }
      
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description || '',
          lead_id: user.id,
          skills: teamData.skills || [],
          portfolio_url: teamData.portfolio_url,
          achievements: teamData.achievements,
          created_at: new Date().toISOString(),
          // No updated_at here
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the team leader as a member
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: data[0].id,
            user_id: user.id,
            role: 'leader',
            status: 'active',
            joined_at: new Date().toISOString(),
          });
          
        if (memberError) throw memberError;
        
        // Fetch the updated team with members
        await fetchTeams();
        
        toast.success('Team created successfully!');
        return data[0].id;
      }
      return null;
    } catch (error: any) {
      toast.error(`Error creating team: ${error.message}`);
      return null;
    }
  };

  // Update an existing team
  const updateTeam = async (teamId: string, teamData: Partial<Team>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Remove updated_at from the teamData since it's not expected by Supabase
      const { updated_at, members, ...dataToUpdate } = teamData as any;
      
      const { error } = await supabase
        .from('teams')
        .update(dataToUpdate)
        .eq('id', teamId)
        .eq('lead_id', user.id); // Ensure user is the team leader

      if (error) throw error;
      
      // Update the team in the state
      setTeams(prev => 
        prev.map(team => 
          team.id === teamId ? { ...team, ...teamData } : team
        )
      );
      
      toast.success('Team updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error updating team: ${error.message}`);
      return false;
    }
  };

  // Delete a team
  const deleteTeam = async (teamId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .eq('lead_id', user.id); // Ensure user is the team leader

      if (error) throw error;
      
      // Remove the team from the state
      setTeams(prev => prev.filter(team => team.id !== teamId));
      
      toast.success('Team deleted successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error deleting team: ${error.message}`);
      return false;
    }
  };

  // Join a team
  const joinTeam = async (teamId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user is already a member of this team
      const team = teams.find(t => t.id === teamId);
      if (team && team.members?.some(member => member.user_id === user.id)) {
        toast.error('You are already a member of this team');
        return false;
      }
      
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member',
          status: 'pending',
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Refresh teams to get updated members
      await fetchTeams();
      
      toast.success('Team join request sent successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error joining team: ${error.message}`);
      return false;
    }
  };

  // Leave a team
  const leaveTeam = async (teamId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update the teams state
      setTeams(prev => 
        prev.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              members: team.members?.filter(member => member.user_id !== user.id) || []
            };
          }
          return team;
        })
      );
      
      toast.success('Left team successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error leaving team: ${error.message}`);
      return false;
    }
  };

  // Add a member to a team
  const addTeamMember = async (teamId: string, userId: string, role: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user is the team leader
      const team = teams.find(t => t.id === teamId);
      if (!team || team.lead_id !== user.id) {
        toast.error('Only team leaders can add members');
        return false;
      }
      
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Refresh teams to get updated members
      await fetchTeams();
      
      toast.success('Team member added successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error adding team member: ${error.message}`);
      return false;
    }
  };

  // Remove a member from a team
  const removeTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user is the team leader
      const team = teams.find(t => t.id === teamId);
      if (!team || team.lead_id !== user.id) {
        toast.error('Only team leaders can remove members');
        return false;
      }
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Update the teams state
      setTeams(prev => 
        prev.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              members: team.members?.filter(member => member.user_id !== userId) || []
            };
          }
          return team;
        })
      );
      
      toast.success('Team member removed successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error removing team member: ${error.message}`);
      return false;
    }
  };

  // Create a new team task
  const createTeamTask = async (teamId: string, taskData: Partial<TeamTask>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Make sure title and status are provided as they are required
      if (!taskData.title || !taskData.status) {
        toast.error('Task title and status are required');
        return null;
      }
      
      const { data, error } = await supabase
        .from('team_tasks')
        .insert({
          team_id: teamId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          due_date: taskData.due_date,
          assigned_to: taskData.assigned_to,
          created_by: user.id,
          created_at: new Date().toISOString(),
          // No updated_at here
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Refresh teams to get updated tasks
        await fetchTeams();
        
        toast.success('Task created successfully!');
        return data[0].id;
      }
      return null;
    } catch (error: any) {
      toast.error(`Error creating task: ${error.message}`);
      return null;
    }
  };

  // Add a project task (missing method)
  const addTask = async (projectId: string, milestoneId: string, taskData: Partial<ProjectTask>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Make sure title is provided as it is required
      if (!taskData.title) {
        toast.error('Task title is required');
        return null;
      }
      
      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          milestone_id: milestoneId,
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status || 'todo',
          due_date: taskData.due_date,
          assigned_to: taskData.assigned_to,
          created_by: user.id,
          created_at: new Date().toISOString(),
          completed: false,
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success('Task created successfully!');
        return data[0].id;
      }
      return null;
    } catch (error: any) {
      toast.error(`Error creating task: ${error.message}`);
      return null;
    }
  };

  // Add a project milestone (missing method)
  const addMilestone = async (projectId: string, milestoneData: Partial<ProjectMilestone>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Make sure title is provided as it is required
      if (!milestoneData.title) {
        toast.error('Milestone title is required');
        return null;
      }
      
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          title: milestoneData.title,
          description: milestoneData.description || '',
          status: milestoneData.status || 'not_started',
          due_date: milestoneData.due_date,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success('Milestone created successfully!');
        return data[0].id;
      }
      return null;
    } catch (error: any) {
      toast.error(`Error creating milestone: ${error.message}`);
      return null;
    }
  };

  // Update an existing team task
  const updateTeamTask = async (taskId: string, taskData: Partial<TeamTask>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Remove updated_at and created_at from the taskData since these are managed by the trigger
      const { updated_at, created_at, ...dataToUpdate } = taskData as any;
      
      const { error } = await supabase
        .from('team_tasks')
        .update(dataToUpdate)
        .eq('id', taskId);

      if (error) throw error;
      
      // Refresh teams to get updated tasks
      await fetchTeams();
      
      toast.success('Task updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`);
      return false;
    }
  };

  // Delete a team task
  const deleteTeamTask = async (taskId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('team_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      // Refresh teams to get updated tasks
      await fetchTeams();
      
      toast.success('Task deleted successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error deleting task: ${error.message}`);
      return false;
    }
  };

  // Update a task status to handle "review" status
  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success('Task updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`);
      return false;
    }
  };

  // Implementation for applyToProject function
  const applyToProject = async (projectId: string, teamId: string, coverLetter: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if user already applied to this project with this team
      const existingApplication = applications.find(
        app => app.project_id === projectId && app.team_id === teamId
      );
      
      if (existingApplication) {
        toast.error('This team has already applied to this project');
        return false;
      }
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          user_id: user.id,
          team_id: teamId,
          cover_letter: coverLetter,
          status: 'pending' as ApplicationStatus,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new application to the state
        setApplications(prev => [data[0] as Application, ...prev]);
        toast.success('Application submitted successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(`Error submitting application: ${error.message}`);
      return false;
    }
  };

  // Implementation for updateApplicationStatus function
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      // Update the application in the state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      toast.success(`Application ${status} successfully!`);
      return true;
    } catch (error: any) {
      toast.error(`Error updating application: ${error.message}`);
      return false;
    }
  };

  const value = {
    projects,
    applications,
    teams,
    loading,
    error,
    fetchProjects,
    fetchApplications,
    fetchTeams,
    getUserProjects,
    getUserApplications,
    getUserTeams,
    createProject,
    updateProject,
    deleteProject,
    submitApplication,
    updateApplication,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    addTeamMember,
    removeTeamMember,
    createTeamTask,
    updateTeamTask,
    deleteTeamTask,
    updateTaskStatus,
    // Add the implemented functions to the context value
    applyToProject,
    updateApplicationStatus,
    fetchProject,
    addTask,
    addMilestone,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;
