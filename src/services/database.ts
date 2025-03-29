import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
export type Project = Tables['projects']['Row'] & {
  applications?: Application[];
};
type Application = Tables['applications']['Row'];
type Milestone = Tables['milestones']['Row'];
type Task = Tables['tasks']['Row'];
type Message = Tables['messages']['Row'];
type Review = Tables['reviews']['Row'];
type Notification = Tables['notifications']['Row'];

export type Team = Tables['teams']['Row'] & {
  members?: TeamMember[];
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: 'lead' | 'member';
  status: 'pending' | 'active' | 'rejected';
  joined_at: string;
  user: {
    name: string;
  };
};

export type ProjectMilestone = {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  assigned_team_id?: string;
  created_at: string;
  updated_at: string;
  tasks?: ProjectTask[];
};

export type ProjectTask = {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ProjectDocument = {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};

export type ProjectMessage = {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
};

export type ProjectFeedback = {
  id: string;
  project_id: string;
  milestone_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
};

// Profile Services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadPortfolio(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-portfolio.${fileExt}`;
    const filePath = `portfolios/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolios')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};

// Project Services
export const projectService = {
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listProjects(filters?: {
    status?: Project['status'];
    category?: string;
    created_by?: string;
  }): Promise<Project[]> {
    let query = supabase.from('projects').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  deleteProject: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Milestone methods
  async createMilestone(milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectMilestone> {
    const { data, error } = await supabase
      .from('project_milestones')
      .insert(milestone)
      .select(`
        *,
        tasks:project_tasks(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const { data, error } = await supabase
      .from('project_milestones')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        tasks:project_tasks(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    const { data, error } = await supabase
      .from('project_milestones')
      .select(`
        *,
        tasks:project_tasks(*)
      `)
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Task methods
  async createTask(task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectTask> {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    const { data, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    const { data, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        assigned_to:profiles(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Document methods
  async uploadDocument(document: Omit<ProjectDocument, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectDocument> {
    const { data, error } = await supabase
      .from('project_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
    const { data, error } = await supabase
      .from('project_documents')
      .select(`
        *,
        uploaded_by:profiles(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Message methods
  async sendMessage(message: Omit<ProjectMessage, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectMessage> {
    const { data, error } = await supabase
      .from('project_messages')
      .insert(message)
      .select(`
        *,
        sender:profiles(name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectMessages(projectId: string): Promise<ProjectMessage[]> {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        sender:profiles(name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Feedback methods
  async createFeedback(feedback: Omit<ProjectFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectFeedback> {
    const { data, error } = await supabase
      .from('project_feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectFeedback(projectId: string): Promise<ProjectFeedback[]> {
    const { data, error } = await supabase
      .from('project_feedback')
      .select(`
        *,
        reviewer:profiles(name),
        reviewee:profiles(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Analytics methods
  async getProjectAnalytics(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalMilestones: number;
    completedMilestones: number;
    averageFeedbackRating: number;
  }> {
    const [
      { count: totalTasks },
      { count: completedTasks },
      { count: totalMilestones },
      { count: completedMilestones },
      { data: feedbackData }
    ] = await Promise.all([
      supabase.from('project_tasks').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('project_tasks').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('status', 'completed'),
      supabase.from('project_milestones').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('project_milestones').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('status', 'completed'),
      supabase.from('project_feedback').select('rating').eq('project_id', projectId)
    ]);

    const averageFeedbackRating = feedbackData && feedbackData.length > 0
      ? feedbackData.reduce((sum, item) => sum + item.rating, 0) / feedbackData.length
      : 0;

    return {
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      totalMilestones: totalMilestones || 0,
      completedMilestones: completedMilestones || 0,
      averageFeedbackRating
    };
  }
};

// Team Services
export const teamService = {
  createTeam: async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        ...team,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
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
      .single();

    if (error) throw error;
    return data;
  },

  updateTeam: async (id: string, updates: Partial<Team>) => {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      .single();

    if (error) throw error;
    return data;
  },

  deleteTeam: async (id: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  addTeamMember: async (teamId: string, userId: string, role: 'member' = 'member') => {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role,
        status: 'pending',
        joined_at: new Date().toISOString()
      }])
      .select(`
        *,
        user:profiles(name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  removeTeamMember: async (teamId: string, userId: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  getTeamMembers: async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:profiles(name)
      `)
      .eq('team_id', teamId);

    if (error) throw error;
    return data;
  },

  getTeamInviteLink: async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_invites')
      .insert([{
        team_id: teamId,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }])
      .select()
      .single();

    if (error) throw error;
    return `${window.location.origin}/join-team/${data.code}`;
  },

  joinTeamByInvite: async (code: string, userId: string) => {
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('code', code)
      .single();

    if (inviteError || !invite || new Date(invite.expires_at) < new Date()) {
      throw new Error('Invalid or expired invite code');
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: invite.team_id,
        user_id: userId,
        role: 'member',
        status: 'active',
        joined_at: new Date().toISOString()
      }])
      .select(`
        *,
        user:profiles(name)
      `)
      .single();

    if (error) throw error;

    // Delete the used invite
    await supabase
      .from('team_invites')
      .delete()
      .eq('id', invite.id);

    return data;
  },

  getTeamApplications: async (teamId: string): Promise<Application[]> => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};

// Application Services
export const applicationService = {
  async createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        project_id: application.project_id,
        team_id: application.team_id,
        cover_letter: application.cover_letter,
        status: application.status
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addApplicationMember(applicationId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('application_members')
      .insert({
        application_id: applicationId,
        user_id: userId,
        role
      });

    if (error) throw error;
  },

  async getApplicationMembers(applicationId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('application_members')
      .select(`
        user_id,
        role,
        profiles:user_id (
          id,
          email,
          name,
          role,
          avatar_url,
          created_at,
          updated_at,
          company_name,
          company_description,
          industry,
          company_size,
          founded,
          website,
          skills,
          education,
          portfolio_url,
          resume_url,
          github_url,
          linkedin_url,
          bio,
          availability,
          interests,
          experience_level,
          preferred_categories,
          reputation_score,
          total_projects,
          completed_projects
        )
      `)
      .eq('application_id', applicationId);

    if (error) throw error;
    return data.map(item => ({
      ...item.profiles,
      resume: (item.profiles as any).resume_url
    } as unknown as Profile));
  },

  async getProjectApplications(projectId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        application_members (
          user_id,
          role,
          profiles:user_id (
            id,
            name,
            email,
            resume_url
          )
        )
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data.map(app => ({
      ...app,
      team_lead: app.application_members?.find(m => m.role === 'lead')?.profiles.name,
      members: app.application_members?.map(member => ({
        id: member.user_id,
        name: member.profiles.name,
        resume: member.profiles.resume_url
      }))
    }));
  },

  updateApplicationStatus: async (applicationId: string, status: Application['status']): Promise<Application> => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteApplication: async (applicationId: string): Promise<void> => {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);
    
    if (error) throw error;
  },
};

// Message Services
export const messageService = {
  async sendMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectMessages(projectId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id (*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};

// Review Services
export const reviewService = {
  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectReviews(projectId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:reviewer_id (*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:reviewer_id (*)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Notification Services
export const notificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  }
}; 