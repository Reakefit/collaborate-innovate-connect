
import { supabase } from '@/lib/supabase';
import { Project, Application, ProjectMessage, Team, TeamMember, Profile } from '@/types/database';

// Fetch all projects from the database
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;
    
    // Fix type conversion by adding the missing properties
    return (data as unknown as Project[]).map(project => ({
      ...project,
      equity_percentage: project.equity_percentage || null,
      hourly_rate: project.hourly_rate || null,
      fixed_amount: project.fixed_amount || null,
      required_skills: project.required_skills || [],
      deliverables: project.deliverables || [],
      status: project.status || 'open'
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Fetch a single project by ID
export const fetchProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Fix type conversion by adding the missing properties
    return {
      ...data,
      equity_percentage: data.equity_percentage || null,
      hourly_rate: data.hourly_rate || null,
      fixed_amount: data.fixed_amount || null,
      required_skills: data.required_skills || [],
      deliverables: data.deliverables || [],
      status: data.status || 'open'
    } as Project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

// Fetch applications for a given project
export const fetchApplicationsForProject = async (projectId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        team:team_id (id, name),
        user:user_id (id, email)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    
    // Fix type conversion by properly transforming team object
    return (data || []).map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: app.status,
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at,
      team: app.team ? {
        id: app.team.id,
        name: app.team.name,
        description: '',
        lead_id: '',
        skills: [],
        created_at: '',
        updated_at: '',
      } : undefined
    })) as Application[];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

// Fetch applications with teams for the current user or a project
export const fetchApplicationsWithTeams = async (projectId?: string): Promise<Application[]> => {
  try {
    let query = supabase
      .from('applications')
      .select(`
        *,
        team:team_id (
          id, 
          name, 
          description, 
          lead_id, 
          portfolio_url, 
          skills
        )
      `);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Transform data to match Application type
    return (data || []).map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: app.status,
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at,
      team: app.team ? {
        id: app.team.id,
        name: app.team.name,
        description: app.team.description || '',
        lead_id: app.team.lead_id,
        skills: app.team.skills || [],
        portfolio_url: app.team.portfolio_url,
        created_at: '',
        updated_at: '',
        achievements: null
      } : undefined
    })) as Application[];
  } catch (error) {
    console.error('Error fetching applications with teams:', error);
    return [];
  }
};

// Fetch applications for the current user
export const fetchUserApplications = async (userId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        project:project_id (id, title, description, created_by, status)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    
    return data as unknown as Application[];
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return [];
  }
};

// Fetch messages for a project
export const fetchProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        sender:sender_id (id, name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return data as unknown as ProjectMessage[];
  } catch (error) {
    console.error('Error fetching project messages:', error);
    return [];
  }
};

// Fetch team data for a specific team
export const fetchTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        lead:lead_id (id, name, avatar_url)
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;
    
    return data as Team;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
};

// Fetch all team members for a team
export const fetchTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:user_id (id, name, avatar_url, role)
      `)
      .eq('team_id', teamId);

    if (error) throw error;
    
    // Fix the type conversion by adding the missing 'name' property
    return (data || []).map(member => ({
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role,
      status: member.status,
      joined_at: member.joined_at,
      name: member.user?.name || '',
      user: member.user
    })) as TeamMember[];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

// Fetch user profile by ID
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Fix founded type mismatch (number in DB, string in type)
    const profile = {
      ...data,
      founded: data.founded ? String(data.founded) : null
    } as unknown as Profile;
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Create user profile if it doesn't exist
export const createUserProfileIfNotExists = async (userId: string, initialData: Partial<Profile> = {}): Promise<void> => {
  try {
    // First check if profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    // If no profile exists, create one
    if (error && error.code === 'PGRST116') {
      // Convert founded from string to number if present
      const dbData = {
        ...initialData,
        id: userId,
        founded: initialData.founded ? parseInt(initialData.founded, 10) : null
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(dbData);
      
      if (insertError) throw insertError;
    } else if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};
