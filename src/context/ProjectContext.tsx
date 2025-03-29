
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import {
  projectService,
  applicationService
} from "@/services/database";
import type { Database } from "@/integrations/supabase/types";
import {
  Application,
  Team,
  Project,
  ProjectMilestone,
  ProjectTask,
  ProjectMessage,
  ProjectReview,
  ProjectNotification,
  ProjectFeedback,
  ApplicationStatus,
  MilestoneStatus,
  TaskStatus,
  TeamRole,
  TeamMemberStatus,
  TeamTask,
  TeamMessage,
  TeamMember
} from "@/types/database";

export type ProjectCategory = 
  | "MVP Development" 
  | "Market Research" 
  | "GTM Strategy" 
  | "Design" 
  | "Content Creation"
  | "Social Media"
  | "Data Analysis"
  | "Other";

export type PaymentModel = "Pro-bono" | "Stipend" | "Equity" | "Certificate";

export interface ProjectContextType {
  projects: Project[];
  teams: Team[];
  userApplications: Application[];
  applications: Application[];
  loading: boolean;
  error: string | null;
  // Project Management
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, project: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Promise<Project>;
  // Team Management
  createTeam: (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => Promise<Team>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  addTeamMember: (teamId: string, userId: string, role?: TeamRole) => Promise<TeamMember>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  getTeamInviteLink: (teamId: string) => Promise<string>;
  getTeamApplications: (teamId: string) => Promise<Application[]>;
  // Application Management
  createApplication: (application: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => Promise<Application>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<Application>;
  deleteApplication: (applicationId: string) => Promise<void>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<Application>;
  // Milestone Management
  createMilestone: (milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>) => Promise<ProjectMilestone>;
  updateMilestone: (id: string, milestone: Partial<ProjectMilestone>) => Promise<ProjectMilestone>;
  deleteMilestone: (id: string) => Promise<void>;
  getProjectMilestones: (projectId: string) => Promise<ProjectMilestone[]>;
  // Task Management
  createTask: (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>) => Promise<ProjectTask>;
  updateTask: (id: string, task: Partial<ProjectTask>) => Promise<ProjectTask>;
  deleteTask: (id: string) => Promise<void>;
  getProjectTasks: (projectId: string) => Promise<ProjectTask[]>;
  // Message Management
  sendMessage: (message: Omit<ProjectMessage, 'id' | 'created_at' | 'updated_at'>) => Promise<ProjectMessage>;
  getProjectMessages: (projectId: string) => Promise<ProjectMessage[]>;
  // Review Management
  createReview: (review: Omit<ProjectReview, 'id' | 'created_at'>) => Promise<ProjectReview>;
  getProjectReviews: (projectId: string) => Promise<ProjectReview[]>;
  // Notification Management
  createNotification: (notification: Omit<ProjectNotification, 'id' | 'created_at'>) => Promise<ProjectNotification>;
  getProjectNotifications: (projectId: string, userId: string) => Promise<ProjectNotification[]>;
  markNotificationAsRead: (id: string) => Promise<void>;
  // Analytics
  getProjectAnalytics: (projectId: string) => Promise<{
    totalTasks: number;
    completedTasks: number;
    totalMilestones: number;
    completedMilestones: number;
    averageFeedbackRating: number;
  }>;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchProjects(),
          fetchTeams(),
          fetchApplications()
        ]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as Project[] || []);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            id,
            user_id,
            role,
            status,
            user:profiles(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Explicitly cast each team member's role and status to the appropriate types
      const typedTeams: Team[] = (data || []).map(team => ({
        ...team,
        members: team.members?.map(member => ({
          ...member,
          role: member.role as TeamRole,
          status: member.status as TeamMemberStatus
        }))
      }));
      
      setTeams(typedTeams);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          project_id,
          team_id,
          user_id,
          cover_letter,
          status,
          created_at,
          updated_at,
          team:teams (
            id,
            name,
            description,
            lead_id,
            skills,
            portfolio_url,
            achievements,
            created_at,
            updated_at,
            members:team_members (
              id,
              user_id,
              role,
              status,
              user:profiles (
                name
              )
            )
          ),
          project:projects (
            id,
            title,
            description,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        setError(error.message);
        return;
      }

      // Explicitly cast data to Application type with proper typing for nested objects
      const typedData: Application[] = (data || []).map(item => {
        // Cast the team members' role and status to the appropriate types
        const typedTeam = item.team?.[0] ? {
          ...item.team[0],
          members: item.team[0].members?.map(member => ({
            ...member,
            role: member.role as TeamRole,
            status: member.status as TeamMemberStatus
          }))
        } : undefined;
        
        return {
          ...item,
          status: item.status as ApplicationStatus,
          team: typedTeam as Team | undefined,
          project: item.project?.[0] as Project | undefined
        };
      });
      
      setUserApplications(typedData);
      setApplications(typedData);
    } catch (error: any) {
      console.error('Error in fetchApplications:', error);
      setError(error.message);
    }
  };

  const createTeam = async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          description: team.description,
          lead_id: team.lead_id,
          skills: team.skills,
          portfolio_url: team.portfolio_url,
          achievements: team.achievements
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as a team lead
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: team.lead_id,
          role: 'lead' as TeamRole,
          status: 'active' as TeamMemberStatus
        });

      if (memberError) throw memberError;

      // Fetch the team with members
      const { data: fullTeam, error: fetchError } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members (
            id,
            user_id,
            role,
            status,
            user:profiles (name)
          )
        `)
        .eq('id', teamData.id)
        .single();

      if (fetchError) throw fetchError;

      // Create properly typed team object
      const typedTeam: Team = {
        ...fullTeam,
        members: fullTeam.members?.map(member => ({
          ...member,
          role: member.role as TeamRole,
          status: member.status as TeamMemberStatus
        }))
      };

      setTeams(prevTeams => [typedTeam, ...prevTeams]);
      return typedTeam;
    } catch (error: any) {
      console.error('Error creating team:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTeam: Team = {
        ...data,
        members: data.members?.map(member => ({
          ...member,
          role: member.role as TeamRole,
          status: member.status as TeamMemberStatus
        }))
      };

      setTeams(teams.map(team => team.id === id ? updatedTeam : team));
      return updatedTeam;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeams(teams.filter(team => team.id !== id));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const addTeamMember = async (teamId: string, userId: string, role: TeamRole = 'member'): Promise<TeamMember> => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role: role,
          status: 'pending' as TeamMemberStatus,
          joined_at: new Date().toISOString()
        }])
        .select(`
          *,
          user:profiles(name)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        team_id: data.team_id,
        user_id: data.user_id,
        role: data.role as TeamRole,
        status: data.status as TeamMemberStatus,
        joined_at: data.joined_at,
        user: {
          name: data.user.name
        }
      };
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh teams to get updated member list
      fetchTeams();
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !profile) throw new Error("You must be logged in to create a project");
    if (profile.role !== "startup") throw new Error("Only startups can create projects");

    try {
      const newProject = await projectService.createProject(project);
      setProjects(prevProjects => [...prevProjects, newProject as Project]);
      toast.success("Project created successfully");
      return newProject as Project;
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
      throw error;
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!user) throw new Error("You must be logged in to update a project");

    try {
      const updatedProject = await projectService.updateProject(id, project);
      setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject as Project : p));
      toast.success("Project updated successfully");
      return updatedProject as Project;
    } catch (error: any) {
      toast.error(error.message || "Failed to update project");
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error("You must be logged in to delete a project");

    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success("Project deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
      throw error;
    }
  };

  const getProject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (
            *,
            tasks (*)
          ),
          reviews (*),
          applications (
            *,
            team (
              *,
              members (
                *,
                user:profiles (name, avatar_url)
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    if (!user) throw new Error("You must be logged in to update an application");

    try {
      const updatedApplication = await applicationService.updateApplicationStatus(applicationId, status);
      setUserApplications(prev => 
        prev.map(a => a.id === applicationId ? {
          ...a, 
          status: status 
        } : a)
      );
      toast.success(`Application status updated to ${status}`);
      return updatedApplication as Application;
    } catch (error: any) {
      toast.error(error.message || "Failed to update application status");
      throw error;
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!user) throw new Error("You must be logged in to delete an application");

    try {
      await applicationService.deleteApplication(applicationId);
      setUserApplications(prev => prev.filter(a => a.id !== applicationId));
      toast.success("Application deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete application");
      throw error;
    }
  };

  const getTeamInviteLink = async (teamId: string) => {
    // Implementation of getTeamInviteLink function
    throw new Error("Method not implemented");
  };

  const getTeamApplications = async (teamId: string) => {
    // Implementation of getTeamApplications function
    throw new Error("Method not implemented");
  };

  const createApplication = async (application: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => {
    // Implementation of createApplication function
    throw new Error("Method not implemented");
  };

  const applyToProject = async (projectId: string, teamId: string, coverLetter: string) => {
    try {
      if (!user) throw new Error("You must be logged in to apply to a project");
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          team_id: teamId,
          user_id: user.id,
          cover_letter: coverLetter,
          status: 'pending' as ApplicationStatus
        })
        .select(`
          *,
          team:teams (
            id,
            name,
            description,
            lead_id,
            skills,
            portfolio_url,
            achievements,
            created_at,
            updated_at,
            members:team_members (
              id,
              user_id,
              role,
              status,
              user:profiles (
                name
              )
            )
          ),
          project:projects (
            id,
            title,
            description,
            status,
            created_at
          )
        `)
        .single();

      if (error) throw error;

      const newApplication: Application = {
        ...data,
        status: data.status as ApplicationStatus,
        team: data.team?.[0] as Team,
        project: data.project?.[0] as Project
      };
      
      setUserApplications(prev => [...prev, newApplication]);
      setApplications(prev => [...prev, newApplication]);

      return newApplication;
    } catch (error: any) {
      console.error('Error applying to project:', error);
      throw error;
    }
  };

  const createMilestone = async (milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert(milestone)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectMilestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  };

  const updateMilestone = async (id: string, milestone: Partial<ProjectMilestone>) => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .update(milestone)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectMilestone;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  };

  const getProjectMilestones = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          *,
          tasks (*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map(milestone => ({
        ...milestone,
        status: milestone.status as MilestoneStatus,
        tasks: milestone.tasks?.map(task => ({
          ...task,
          status: task.status as TaskStatus
        }))
      })) as ProjectMilestone[];
    } catch (error) {
      console.error('Error fetching project milestones:', error);
      throw error;
    }
  };

  const createTask = async (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, task: Partial<ProjectTask>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const getProjectTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map(task => ({
        ...task,
        status: task.status as TaskStatus
      })) as ProjectTask[];
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  };

  const sendMessage = async (message: Omit<ProjectMessage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const getProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ProjectMessage[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const createReview = async (review: Omit<ProjectReview, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  };

  const getProjectReviews = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectReview[];
    } catch (error) {
      console.error('Error fetching project reviews:', error);
      throw error;
    }
  };

  const createNotification = async (notification: Omit<ProjectNotification, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          project_id: notification.project_id,
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          content: notification.content,
          read: notification.read || false
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const getProjectNotifications = async (projectId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectNotification[];
    } catch (error) {
      console.error('Error fetching project notifications:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const getProjectAnalytics = async (projectId: string) => {
    try {
      const [tasks, milestones, reviews] = await Promise.all([
        getProjectTasks(projectId),
        getProjectMilestones(projectId),
        getProjectReviews(projectId)
      ]);

      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        totalMilestones: milestones.length,
        completedMilestones: milestones.filter(m => m.status === 'completed').length,
        averageFeedbackRating: reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          : 0
      };
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  };

  const value: ProjectContextType = {
    projects,
    teams,
    userApplications,
    applications,
    loading,
    error: error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    getTeamInviteLink,
    getTeamApplications,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    applyToProject,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    getProjectMilestones,
    createTask,
    updateTask,
    deleteTask,
    getProjectTasks,
    sendMessage,
    getProjectMessages,
    createReview,
    getProjectReviews,
    createNotification,
    getProjectNotifications,
    markNotificationAsRead,
    getProjectAnalytics
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
