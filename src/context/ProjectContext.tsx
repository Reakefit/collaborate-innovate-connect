
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { 
  Project, Application, Team, TeamTask, TeamMember, ProjectMilestone, 
  MilestoneStatus, TaskStatus, ProjectTask, ApplicationStatus, TeamTaskStatus,
  ProjectCategory, PaymentModel, ProjectStatus
} from '@/types/database';
import { toast } from 'sonner';
import { fetchApplicationsWithTeams } from '@/services/database';

interface ProjectContextType {
  projects: Project[];
  applications: Application[];
  teams: Team[];
  loading: boolean;
  error: string | null;
  fetchProject: (id: string) => Promise<Project | null>;
  fetchProjects: () => Promise<void>;
  createProject: (projectData: any) => Promise<Project | null>;
  updateProject: (id: string, projectData: any) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  getUserProjects: () => Project[];
  updateProjectStatus: (id: string, status: string) => Promise<boolean>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<boolean>;
  createTeam: (teamData: any) => Promise<Team | null>;
  updateTeam: (id: string, teamData: any) => Promise<boolean>;
  deleteTeam: (id: string) => Promise<boolean>;
  joinTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  fetchTeam: (id: string) => Promise<Team | null>;
  fetchTeams: () => Promise<void>;
  fetchUserTeams: () => Promise<Team[]>;
  fetchTeamTasks: (teamId: string) => Promise<TeamTask[]>;
  createTeamTask: (teamId: string, taskData: any) => Promise<TeamTask | null>;
  updateTeamTask: (teamId: string, taskId: string, taskData: any) => Promise<boolean>;
  deleteTeamTask: (teamId: string, taskId: string) => Promise<boolean>;
  fetchApplications: (projectId: string) => Promise<Application[]>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<boolean>;
  addTask: (projectId: string, milestoneId: string, taskData: any) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  addMilestone: (projectId: string, milestoneData: any) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  applications: [],
  teams: [],
  loading: false,
  error: null,
  fetchProject: async () => null,
  fetchProjects: async () => {},
  createProject: async () => null,
  updateProject: async () => false,
  deleteProject: async () => false,
  getUserProjects: () => [],
  updateProjectStatus: async () => false,
  applyToProject: async () => false,
  createTeam: async () => null,
  updateTeam: async () => false,
  deleteTeam: async () => false,
  joinTeam: async () => false,
  leaveTeam: async () => false,
  fetchTeam: async () => null,
  fetchTeams: async () => {},
  fetchUserTeams: async () => [],
  fetchTeamTasks: async () => [],
  createTeamTask: async () => null,
  updateTeamTask: async () => false,
  deleteTeamTask: async () => false,
  fetchApplications: async () => [],
  updateApplicationStatus: async () => false,
  addTask: async () => false,
  updateTaskStatus: async () => false,
  addMilestone: async () => false,
});

export const ProjectProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Define joinTeam before it's used in createTeam
  const joinTeam = useCallback(async (teamId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to join a team');
      }
      
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member',
          status: 'active'
        });
      
      if (error) throw error;
      
      // Update the team in the state with proper typing
      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === teamId
            ? { 
                ...team, 
                members: [
                  ...(team.members || []), 
                  { 
                    id: '', // Temporary ID that will be replaced when refetching
                    user_id: user.id, 
                    team_id: teamId,
                    role: 'member', 
                    status: 'active',
                    joined_at: new Date().toISOString(),
                    name: '' // Temporary name that will be replaced when refetching
                  } as TeamMember
                ] 
              }
            : team
        )
      );
      
      toast.success('Joined team successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error joining team:', error);
      toast.error('Failed to join team.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) throw error;
      
      // Make sure to properly format the project data to match the Project type
      const formattedProjects: Project[] = data.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        created_by: project.created_by,
        category: (project.category || 'other') as ProjectCategory,
        required_skills: project.required_skills || [],
        start_date: project.start_date,
        end_date: project.end_date,
        team_size: project.team_size,
        payment_model: (project.payment_model || 'unpaid') as PaymentModel,
        stipend_amount: project.stipend_amount ? String(project.stipend_amount) : null,
        equity_percentage: project.equity_percentage ? String(project.equity_percentage || '0') : null,
        hourly_rate: project.hourly_rate ? String(project.hourly_rate || '0') : null,
        fixed_amount: project.fixed_amount ? String(project.fixed_amount || '0') : null,
        deliverables: project.deliverables || [],
        created_at: project.created_at,
        selected_team: project.selected_team || null,
        status: (project.status || 'open') as ProjectStatus
      }));
      
      setProjects(formattedProjects);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones:project_milestones(
            *,
            tasks:project_tasks(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Format the project data to match the Project type
      const formattedProject: Project = {
        id: data.id,
        title: data.title,
        description: data.description,
        created_by: data.created_by,
        category: (data.category || 'other') as ProjectCategory,
        required_skills: data.required_skills || [],
        start_date: data.start_date,
        end_date: data.end_date,
        team_size: data.team_size,
        payment_model: (data.payment_model || 'unpaid') as PaymentModel,
        stipend_amount: data.stipend_amount ? String(data.stipend_amount) : null,
        equity_percentage: data.equity_percentage ? String(data.equity_percentage || '0') : null,
        hourly_rate: data.hourly_rate ? String(data.hourly_rate || '0') : null,
        fixed_amount: data.fixed_amount ? String(data.fixed_amount || '0') : null,
        deliverables: data.deliverables || [],
        created_at: data.created_at,
        selected_team: data.selected_team || null,
        status: (data.status || 'open') as ProjectStatus,
        milestones: Array.isArray(data.milestones) ? data.milestones.map((milestone: any) => ({
          ...milestone,
          status: (milestone.status || 'pending') as MilestoneStatus,
          tasks: Array.isArray(milestone.tasks) ? milestone.tasks.map((task: any) => ({
            ...task,
            status: (task.status || 'todo') as TaskStatus
          })) : []
        })) : []
      };
      
      return formattedProject;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData: any): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure the user is authenticated
      if (!user) {
        throw new Error('You must be logged in to create a project');
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          created_by: user.id,
          category: projectData.category,
          required_skills: projectData.required_skills || [],
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          team_size: projectData.team_size,
          payment_model: projectData.payment_model,
          stipend_amount: projectData.stipend_amount || null,
          equity_percentage: projectData.equity_percentage || null,
          hourly_rate: projectData.hourly_rate || null,
          fixed_amount: projectData.fixed_amount || null,
          deliverables: projectData.deliverables || [],
          status: 'open'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Format the created project to match the Project type
      const newProject: Project = {
        id: data.id,
        title: data.title,
        description: data.description,
        created_by: data.created_by,
        category: (data.category || 'other') as ProjectCategory,
        required_skills: data.required_skills || [],
        start_date: data.start_date,
        end_date: data.end_date,
        team_size: data.team_size,
        payment_model: (data.payment_model || 'unpaid') as PaymentModel,
        stipend_amount: data.stipend_amount ? String(data.stipend_amount) : null,
        equity_percentage: data.equity_percentage ? String(data.equity_percentage || '0') : null,
        hourly_rate: data.hourly_rate ? String(data.hourly_rate || '0') : null,
        fixed_amount: data.fixed_amount ? String(data.fixed_amount) : null,
        deliverables: data.deliverables || [],
        created_at: data.created_at,
        selected_team: data.selected_team || null,
        status: (data.status || 'open') as ProjectStatus
      };
      
      // Add the new project to the state
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      return newProject;
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating project:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProject = useCallback(async (id: string, projectData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('projects')
        .update({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          required_skills: projectData.required_skills || [],
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          team_size: projectData.team_size,
          payment_model: projectData.payment_model,
          stipend_amount: projectData.stipend_amount || null,
          equity_percentage: projectData.equity_percentage || null,
          hourly_rate: projectData.hourly_rate || null,
          fixed_amount: projectData.fixed_amount || null,
          deliverables: projectData.deliverables || []
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the project in the state
      setProjects(prevProjects =>
        prevProjects.map(project => (project.id === id ? { ...project, ...projectData } : project))
      );
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating project:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove the project from the state
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting project:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserProjects = useCallback(() => {
    if (!user) return [];
    return projects.filter(project => project.created_by === user.id);
  }, [user, projects]);

  const updateProjectStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('projects')
        .update({ status: status })
        .eq('id', id);

      if (error) throw error;

      // Update the project status in the state
      setProjects(prevProjects =>
        prevProjects.map(project => (project.id === id ? { ...project, status: status as ProjectStatus } : project))
      );

      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating project status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyToProject = useCallback(async (projectId: string, teamId: string, coverLetter: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to apply for a project');
      }
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          user_id: user.id,
          team_id: teamId,
          cover_letter: coverLetter,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new application to the state
      const newApplication: Application = {
        id: data.id,
        project_id: data.project_id,
        user_id: data.user_id,
        team_id: data.team_id,
        status: data.status as ApplicationStatus,
        cover_letter: data.cover_letter,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setApplications(prevApplications => [...prevApplications, newApplication]);
      
      toast.success('Application submitted successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error applying to project:', error);
      toast.error('Failed to submit application.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTeam = useCallback(async (teamData: any): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to create a team');
      }
      
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          lead_id: user.id,
          skills: teamData.skills || [],
          portfolio_url: teamData.portfolio_url || null,
          achievements: teamData.achievements || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the team lead as a member
      await joinTeam(data.id);
      
      // Format the created team to match the Team type
      const newTeam: Team = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        lead_id: data.lead_id,
        skills: data.skills || [],
        portfolio_url: data.portfolio_url || null,
        achievements: data.achievements || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
        members: []
      };
      
      // Add the new team to the state
      setTeams(prevTeams => [...prevTeams, newTeam]);
      
      toast.success('Team created successfully!');
      return newTeam;
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating team:', error);
      toast.error('Failed to create team.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, joinTeam]);

  const updateTeam = useCallback(async (id: string, teamData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamData.name,
          description: teamData.description,
          skills: teamData.skills || [],
          portfolio_url: teamData.portfolio_url || null,
          achievements: teamData.achievements || null
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the team in the state
      setTeams(prevTeams =>
        prevTeams.map(team => (team.id === id ? { ...team, ...teamData } : team))
      );
      
      toast.success('Team updated successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating team:', error);
      toast.error('Failed to update team.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove the team from the state
      setTeams(prevTeams => prevTeams.filter(team => team.id !== id));
      
      toast.success('Team deleted successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveTeam = useCallback(async (teamId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to leave a team');
      }
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update the team in the state
      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === teamId
            ? { ...team, members: (team.members || []).filter(member => member.user_id !== user.id) }
            : team
        )
      );
      
      toast.success('Left team successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTeam = useCallback(async (id: string): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Format the team data to match the Team type
      const formattedTeam: Team = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        lead_id: data.lead_id,
        skills: data.skills || [],
        portfolio_url: data.portfolio_url || null,
        achievements: data.achievements || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
        members: []
      };
      
      return formattedTeam;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching team:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      
      if (error) throw error;
      
      // Format the team data to match the Team type
      const formattedTeams: Team[] = data.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description || '',
        lead_id: team.lead_id,
        skills: team.skills || [],
        portfolio_url: team.portfolio_url || null,
        achievements: team.achievements || null,
        created_at: team.created_at,
        updated_at: team.updated_at,
        members: []
      }));
      
      setTeams(formattedTeams);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserTeams = useCallback(async (): Promise<Team[]> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.warn('User is not authenticated.');
        return [];
      }

      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (teamMembersError) {
        throw teamMembersError;
      }

      const teamIds = teamMembers.map(tm => tm.team_id);

      if (teamIds.length === 0) {
        return [];
      }

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (teamsError) {
        throw teamsError;
      }

      const formattedTeams: Team[] = (teamsData || []).map(team => ({
        id: team.id,
        name: team.name,
        description: team.description || '',
        lead_id: team.lead_id,
        skills: team.skills || [],
        portfolio_url: team.portfolio_url || null,
        achievements: team.achievements || null,
        created_at: team.created_at,
        updated_at: team.updated_at,
        members: []
      }));

      return formattedTeams;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching user teams:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTeamTasks = useCallback(async (teamId: string): Promise<TeamTask[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('team_tasks')
        .select('*')
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      // Format the team task data to match the TeamTask type
      const formattedTeamTasks: TeamTask[] = data.map(task => ({
        id: task.id,
        team_id: task.team_id,
        title: task.title,
        description: task.description || '',
        status: task.status as TeamTaskStatus,
        due_date: task.due_date || null,
        assigned_to: task.assigned_to || null,
        created_by: task.created_by,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
      
      return formattedTeamTasks;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching team tasks:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeamTask = useCallback(async (teamId: string, taskData: any): Promise<TeamTask | null> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to create a team task');
      }
      
      const { data, error } = await supabase
        .from('team_tasks')
        .insert({
          team_id: teamId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'todo',
          due_date: taskData.due_date || null,
          assigned_to: taskData.assigned_to || null,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Format the created team task to match the TeamTask type
      const newTeamTask: TeamTask = {
        id: data.id,
        team_id: data.team_id,
        title: data.title,
        description: data.description || '',
        status: data.status as TeamTaskStatus,
        due_date: data.due_date || null,
        assigned_to: data.assigned_to || null,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return newTeamTask;
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating team task:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateTeamTask = useCallback(async (teamId: string, taskId: string, taskData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('team_tasks')
        .update({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          due_date: taskData.due_date || null,
          assigned_to: taskData.assigned_to || null
        })
        .eq('id', taskId)
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating team task:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeamTask = useCallback(async (teamId: string, taskId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('team_tasks')
        .delete()
        .eq('id', taskId)
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting team task:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async (projectId: string): Promise<Application[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const applications = await fetchApplicationsWithTeams(projectId);
      
      // Ensure all applications have the correct status type
      const typedApplications = applications.map(app => ({
        ...app,
        status: app.status as ApplicationStatus
      }));
      
      setApplications(typedApplications);
      
      return typedApplications;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching applications:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateApplicationStatus = useCallback(async (applicationId: string, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: status })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Update the application status in the state with correct typing
      setApplications(prevApplications =>
        prevApplications.map(application => 
          application.id === applicationId 
            ? { ...application, status: status as ApplicationStatus } 
            : application
        )
      );
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating application status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    projects,
    applications,
    teams,
    loading,
    error,
    fetchProject,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getUserProjects,
    updateProjectStatus,
    applyToProject,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    fetchTeam,
    fetchTeams,
    fetchUserTeams,
    fetchTeamTasks,
    createTeamTask,
    updateTeamTask,
    deleteTeamTask,
    fetchApplications,
    updateApplicationStatus,
    // Implement the missing methods
    addTask,
    updateTaskStatus,
    addMilestone,
  };

  // Implementing the missing methods
  const addTask = useCallback(async (projectId: string, milestoneId: string, taskData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to add a task');
      }
      
      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          milestone_id: milestoneId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'todo',
          assigned_to: taskData.assigned_to || null,
          created_by: user.id,
          due_date: taskData.due_date || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Task added successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding task:', error);
      toast.error('Failed to add task.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('project_tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success('Task status updated successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMilestone = useCallback(async (projectId: string, milestoneData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          title: milestoneData.title,
          description: milestoneData.description || null,
          due_date: milestoneData.due_date,
          status: milestoneData.status || 'not_started'
        });
      
      if (error) throw error;
      
      toast.success('Milestone added successfully!');
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding milestone:', error);
      toast.error('Failed to add milestone.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    projects,
    applications,
    teams,
    loading,
    error,
    fetchProject,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getUserProjects,
    updateProjectStatus,
    applyToProject,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    fetchTeam,
    fetchTeams,
    fetchUserTeams,
    fetchTeamTasks,
    createTeamTask,
    updateTeamTask,
    deleteTeamTask,
    fetchApplications,
    updateApplicationStatus,
    addTask,
    updateTaskStatus,
    addMilestone,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => useContext(ProjectContext);
