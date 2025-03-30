import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Project, Application, Team, TeamTask, TeamMember } from '@/types/database';
import { toast } from 'sonner';

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
  updateApplication: (applicationId: string, status: 'pending' | 'accepted' | 'rejected') => Promise<boolean>;
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
  updateTaskStatus: (taskId: string, status: string) => Promise<boolean>;
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
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all applications for the current user
  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .or(`user_id.eq.${user.id},project_id.in.(${getUserProjects().map(p => p.id).join(',')})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
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
      const processedTeams = (data || []).map(team => ({
        ...team,
        members: team.members || [],
      }));

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
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new project to the state
        setProjects(prev => [data[0], ...prev]);
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
      const { error } = await supabase
        .from('projects')
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('created_by', user.id); // Ensure user owns the project

      if (error) throw error;
      
      // Update the project in the state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, ...projectData, updated_at: new Date().toISOString() } : project
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
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new application to the state
        setApplications(prev => [data[0], ...prev]);
        toast.success('Application submitted successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(`Error submitting application: ${error.message}`);
      return false;
    }
  };

  // Update an application status
  const updateApplication = async (
    applicationId: string, 
    status: 'pending' | 'accepted' | 'rejected'
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;
      
      // Update the application in the state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status, updated_at: new Date().toISOString() } : app
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
      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          lead_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
      const { error } = await supabase
        .from('teams')
        .update({
          ...teamData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId)
        .eq('lead_id', user.id); // Ensure user is the team leader

      if (error) throw error;
      
      // Update the team in the state
      setTeams(prev => 
        prev.map(team => 
          team.id === teamId ? { ...team, ...teamData, updated_at: new Date().toISOString() } : team
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
      const { data, error } = await supabase
        .from('team_tasks')
        .insert({
          ...taskData,
          team_id: teamId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

  // Update an existing team task
  const updateTeamTask = async (taskId: string, taskData: Partial<TeamTask>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('team_tasks')
        .update({
          ...taskData,
          updated_at: new Date().toISOString(),
        })
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

  // Update a task status
  const updateTaskStatus = async (taskId: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('team_tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Instead of updating state directly (which caused the deep type issues),
      // we'll refetch the data to keep state in sync
      
      // Refetch the teams
      await fetchTeams();
      
      toast.success('Task updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`);
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
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
