import { supabase } from '@/lib/supabase';
import { Application, ApplicationStatus, Profile, Project, ProjectCategory } from '@/types/database';
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
      // Handle payment details
      let equityPercentage = null;
      let hourlyRate = null;
      let fixedAmount = null;

      const projectNeeds = ensureArrayField(project.project_needs);
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
        equity_percentage: equityPercentage,
        hourly_rate: hourlyRate,
        fixed_amount: fixedAmount,
        stipend_amount: project.stipend_amount || null,
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
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Handle payment details
    let equityPercentage = null;
    let hourlyRate = null;
    let fixedAmount = null;

    const projectNeeds = ensureArrayField(data.project_needs);
    const requiredSkills = ensureArrayField(data.required_skills);
    const deliverables = ensureArrayField(data.deliverables);

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
      equity_percentage: equityPercentage,
      hourly_rate: hourlyRate,
      fixed_amount: fixedAmount,
      stipend_amount: data.stipend_amount || null,
      deliverables: deliverables,
      status: data.status,
      selected_team: data.selected_team,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    toast.error('Failed to fetch project details');
    return null;
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
      .insert(profileData);

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
      .upsert(cleanData);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    toast.error('Failed to update profile');
    return false;
  }
};
