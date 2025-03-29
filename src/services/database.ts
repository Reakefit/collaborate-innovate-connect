// First, let's import our type definitions
import { 
  Team, 
  Project, 
  Application, 
  ProjectMilestone, 
  ProjectTask,
  ProjectMessage,
  TeamRole,
  TeamMemberStatus,
  ApplicationStatus,
  MilestoneStatus,
  TaskStatus
} from '@/types/database';
import { supabase } from '@/lib/supabase';

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Fix createProject function to cast status fields to proper types
export const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getProject = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Fix getMilestones function to ensure correct status types
export const getProjectMilestones = async (projectId: string): Promise<ProjectMilestone[]> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        tasks (*)
      `)
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    // Cast milestone.status to MilestoneStatus and task.status to TaskStatus
    const typedMilestones = data.map(milestone => ({
      ...milestone,
      status: milestone.status as MilestoneStatus,
      tasks: milestone.tasks?.map(task => ({
        ...task,
        status: task.status as TaskStatus
      }))
    }));

    return typedMilestones as ProjectMilestone[];
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    throw error;
  }
};

export const getMilestone = async (milestoneId: string) => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting milestone:', error);
    throw error;
  }
};

export const updateMilestone = async (milestoneId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

export const deleteMilestone = async (milestoneId: string) => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

// Fix getProjectTasks function
export const getProjectTasks = async (projectId: string): Promise<ProjectTask[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Cast task.status to TaskStatus
    const typedTasks = data.map(task => ({
      ...task,
      status: task.status as TaskStatus
    }));

    return typedTasks as ProjectTask[];
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    throw error;
  }
};

export const getTask = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getProjectDocuments = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting project documents:', error);
    throw error;
  }
};

export const uploadDocument = async (document: any) => {
  try {
    const { data, error } = await supabase
      .from('project_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Fix ProjectMessages to ensure updated_at field
export const getProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Add updated_at field if missing
    const messagesWithUpdatedAt = data.map(message => ({
      ...message,
      updated_at: message.updated_at || message.created_at,
      sender: message.sender ? {
        name: message.sender.name,
        avatar_url: message.sender.avatar_url
      } : undefined
    }));

    return messagesWithUpdatedAt as ProjectMessage[];
  } catch (error) {
    console.error('Error fetching project messages:', error);
    throw error;
  }
};

export const createReview = async (review: any) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getReviews = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
};

// Fix the team_invites related functionality - this table doesn't exist, so we need to handle this
export const generateTeamInviteLink = async (teamId: string): Promise<string> => {
  // Instead of using nonexistent team_invites table, we'll implement a workaround
  try {
    // Generate a unique code
    const code = Math.random().toString(36).substring(2, 10);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    
    // Store the invite in local storage for demo purposes
    // In a real implementation, we would create a team_invites table
    const invites = JSON.parse(localStorage.getItem('team_invites') || '[]');
    invites.push({
      team_id: teamId,
      code,
      expires_at: expiryDate.toISOString()
    });
    localStorage.setItem('team_invites', JSON.stringify(invites));
    
    // Return the invite link
    return `${window.location.origin}/teams/join?code=${code}`;
  } catch (error) {
    console.error('Error generating team invite link:', error);
    throw error;
  }
};

// Fix validateTeamInvite function
export const validateTeamInvite = async (code: string): Promise<{ teamId: string; valid: boolean }> => {
  try {
    // Retrieve invites from local storage
    const invites = JSON.parse(localStorage.getItem('team_invites') || '[]');
    const invite = invites.find((inv: any) => inv.code === code);
    
    if (!invite) {
      return { teamId: '', valid: false };
    }
    
    const expiryDate = new Date(invite.expires_at);
    const isValid = expiryDate > new Date();
    
    return { teamId: invite.team_id, valid: isValid };
  } catch (error) {
    console.error('Error validating team invite:', error);
    return { teamId: '', valid: false };
  }
};

// Fix the createApplication function to include user_id
export const createApplication = async (application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> => {
  try {
    // Make sure user_id is included
    if (!application.user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      application = {
        ...application,
        user_id: user.id
      };
    }
    
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

export const deleteApplication = async (applicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};
