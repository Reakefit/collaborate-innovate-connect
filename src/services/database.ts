
import { supabase } from '@/lib/supabase';
import { Application, ApplicationStatus, Profile, Project, ProjectCategory, ProjectMessage } from '@/types/database';
import { toast } from 'sonner';

// Helper function to convert string to ProjectCategory enum
const toProjectCategory = (category: string): ProjectCategory => {
  const validCategories: ProjectCategory[] = ['web_development', 'mobile_app', 'data_science', 'machine_learning', 'ui_ux_design', 'blockchain', 'game_development', 'other'];
  return validCategories.includes(category as ProjectCategory) 
    ? (category as ProjectCategory) 
    : 'other';
};

// Helper function to convert string to ApplicationStatus enum
const toApplicationStatus = (status: string): ApplicationStatus => {
  const validStatuses: ApplicationStatus[] = ['pending', 'accepted', 'rejected', 'withdrawn'];
  return validStatuses.includes(status as ApplicationStatus) 
    ? (status as ApplicationStatus) 
    : 'pending';
};

// Helper function for handling project_needs conversion
const ensureArrayField = (field: any): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    return field.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

// Helper function to prepare profile data for database
export const prepareProfileData = (profileData: any): Record<string, any> => {
  const cleanData: Record<string, any> = { ...profileData };
  
  // Handle array fields
  if (cleanData.project_needs) {
    cleanData.project_needs = ensureArrayField(cleanData.project_needs);
  }
  if (cleanData.skills) {
    cleanData.skills = ensureArrayField(cleanData.skills);
  }
  if (cleanData.interests) {
    cleanData.interests = ensureArrayField(cleanData.interests);
  }
  if (cleanData.preferred_categories) {
    cleanData.preferred_categories = ensureArrayField(cleanData.preferred_categories);
  }
  
  // Convert founded to number or null
  if (cleanData.founded !== undefined) {
    cleanData.founded = cleanData.founded ? parseInt(cleanData.founded, 10) || null : null;
  }
  
  return cleanData;
};

// Fetch all projects
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;

    if (!data) return [];

    // Convert server data to Project type
    return data.map(project => {
      const requiredSkills = ensureArrayField(project.required_skills);
      const deliverables = ensureArrayField(project.deliverables);

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        created_by: project.created_by,
        category: toProjectCategory(project.category),
        required_skills: requiredSkills,
        start_date: project.start_date,
        end_date: project.end_date,
        team_size: project.team_size,
        payment_model: project.payment_model,
        equity_percentage: project.equity_percentage ? Number(project.equity_percentage) : null,
        hourly_rate: project.hourly_rate ? Number(project.hourly_rate) : null,
        fixed_amount: project.fixed_amount ? Number(project.fixed_amount) : null,
        stipend_amount: project.stipend_amount ? Number(project.stipend_amount) : null,
        deliverables: deliverables,
        status: project.status,
        selected_team: project.selected_team,
        created_at: project.created_at,
      };
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to fetch projects');
    return [];
  }
};

// Fetch a single project by ID
export const fetchProject = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_milestones(
          *,
          project_tasks(*)
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;

    if (!data) return null;

    const requiredSkills = ensureArrayField(data.required_skills);
    const deliverables = ensureArrayField(data.deliverables);

    // Format milestones and tasks
    const milestones = Array.isArray(data.project_milestones) 
      ? data.project_milestones.map((milestone: any) => ({
          id: milestone.id,
          project_id: milestone.project_id,
          title: milestone.title,
          description: milestone.description,
          due_date: milestone.due_date,
          status: milestone.status,
          created_at: milestone.created_at,
          updated_at: milestone.updated_at,
          tasks: Array.isArray(milestone.project_tasks) 
            ? milestone.project_tasks.map((task: any) => ({
                id: task.id,
                project_id: task.project_id,
                milestone_id: task.milestone_id,
                title: task.title,
                description: task.description,
                status: task.status,
                assigned_to: task.assigned_to,
                due_date: task.due_date,
                created_by: task.created_by,
                created_at: task.created_at,
                updated_at: task.updated_at
              }))
            : []
        }))
      : [];

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      created_by: data.created_by,
      category: toProjectCategory(data.category),
      required_skills: requiredSkills,
      start_date: data.start_date,
      end_date: data.end_date,
      team_size: data.team_size,
      payment_model: data.payment_model,
      equity_percentage: data.equity_percentage ? Number(data.equity_percentage) : null,
      hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : null,
      fixed_amount: data.fixed_amount ? Number(data.fixed_amount) : null,
      stipend_amount: data.stipend_amount ? Number(data.stipend_amount) : null,
      deliverables: deliverables,
      status: data.status,
      selected_team: data.selected_team,
      created_at: data.created_at,
      milestones: milestones
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    toast.error('Failed to fetch project details');
    return null;
  }
};

// Function to fetch applications with team details for a project
export const fetchApplicationsWithTeams = async (projectId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        teams(*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;

    if (!data) return [];

    return data.map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: toApplicationStatus(app.status),
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at,
      team: app.teams
    }));
  } catch (error) {
    console.error('Error fetching applications with teams:', error);
    toast.error('Failed to fetch applications');
    return [];
  }
};

// Function to fetch project messages
export const fetchProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        sender:profiles(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data) return [];

    return data.map(message => ({
      id: message.id,
      project_id: message.project_id,
      content: message.content,
      sender_id: message.sender_id,
      created_at: message.created_at,
      sender: message.sender
    }));
  } catch (error) {
    console.error('Error fetching project messages:', error);
    toast.error('Failed to fetch messages');
    return [];
  }
};

// Fetch project applications
export const fetchProjectApplications = async (projectId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, team:teams(*)')
      .eq('project_id', projectId);

    if (error) throw error;

    if (!data) return [];

    return data.map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: toApplicationStatus(app.status),
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at,
      team: app.team
    }));
  } catch (error) {
    console.error('Error fetching applications:', error);
    toast.error('Failed to fetch applications');
    return [];
  }
};

// Fetch user applications
export const fetchUserApplications = async (userId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, team:teams(*)')
      .eq('user_id', userId);

    if (error) throw error;

    if (!data) return [];

    return data.map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: toApplicationStatus(app.status),
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at,
      team: app.team
    }));
  } catch (error) {
    console.error('Error fetching user applications:', error);
    toast.error('Failed to fetch your applications');
    return [];
  }
};

// Fetch team applications
export const fetchTeamApplications = async (teamId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('team_id', teamId);

    if (error) throw error;

    if (!data) return [];

    return data.map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: toApplicationStatus(app.status),
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at
    }));
  } catch (error) {
    console.error('Error fetching team applications:', error);
    toast.error('Failed to fetch team applications');
    return [];
  }
};

// Create a new project
export const createProject = async (projectData: Partial<Project>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: projectData.title,
        description: projectData.description,
        created_by: projectData.created_by,
        category: projectData.category,
        required_skills: projectData.required_skills || [],
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        team_size: projectData.team_size,
        payment_model: projectData.payment_model,
        stipend_amount: projectData.stipend_amount,
        equity_percentage: projectData.equity_percentage,
        hourly_rate: projectData.hourly_rate,
        fixed_amount: projectData.fixed_amount,
        deliverables: projectData.deliverables || [],
        status: 'open'
      }])
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      return data[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error creating project:', error);
    toast.error('Failed to create project');
    return null;
  }
};

// Update project status
export const updateProjectStatus = async (projectId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating project status:', error);
    toast.error('Failed to update project status');
    return false;
  }
};

// Create a user profile if it doesn't exist
export const createUserProfileIfNotExists = async (userId: string, userData: any): Promise<boolean> => {
  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return true; // Profile already exists
    }

    // Prepare the profile data
    const profileData = prepareProfileData({
      id: userId,
      name: userData.name || userData.email?.split('@')[0] || '',
      email: userData.email,
      role: userData.role || 'student',
      // Add other default fields based on role
      ...(userData.role === 'startup' ? {
        skills: [],
        project_needs: []
      } : {
        skills: [],
        interests: []
      })
    });

    // Create new profile
    const { error } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

// Update a user profile
export const updateUserProfile = async (userId: string, profileData: Partial<Profile>): Promise<boolean> => {
  try {
    // Prepare the profile data for the database
    const cleanData = prepareProfileData({
      ...profileData,
      id: userId
    });

    const { error } = await supabase
      .from('profiles')
      .upsert([cleanData]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    toast.error('Failed to update profile');
    return false;
  }
};
