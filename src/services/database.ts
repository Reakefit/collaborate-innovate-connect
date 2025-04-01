
import { supabase } from '@/lib/supabase';
import { Project, Application, ProjectMessage, Team, TeamMember, Profile } from '@/types/database';

// Fetch all projects from the database
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;
    
    // Transform data to match the Project type
    return (data || []).map(project => ({
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
      stipend_amount: project.stipend_amount ? String(project.stipend_amount) : null,
      equity_percentage: project.equity_percentage ? String(project.equity_percentage) : null,
      hourly_rate: project.hourly_rate ? String(project.hourly_rate) : null,
      fixed_amount: project.fixed_amount ? String(project.fixed_amount) : null,
      deliverables: project.deliverables || [],
      created_at: project.created_at,
      selected_team: project.selected_team || null,
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
    
    // Transform data to match the Project type
    return {
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
      stipend_amount: data.stipend_amount ? String(data.stipend_amount) : null,
      equity_percentage: data.equity_percentage ? String(data.equity_percentage) : null,
      hourly_rate: data.hourly_rate ? String(data.hourly_rate) : null,
      fixed_amount: data.fixed_amount ? String(data.fixed_amount) : null,
      deliverables: data.deliverables || [],
      created_at: data.created_at,
      selected_team: data.selected_team || null,
      status: data.status || 'open'
    };
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
    
    // Transform data to match the Application type
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
    }));
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
    
    // Transform data to match the Application type
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
    }));
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
    
    // Properly transform data to match the Application type
    return (data || []).map(app => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: app.status,
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at
    }));
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
    
    // Transform data to match the TeamMember type with the name property
    return (data || []).map(member => ({
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role,
      status: member.status,
      joined_at: member.joined_at,
      name: member.user?.name || '',
      user: member.user
    }));
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
      // Convert founded from number to string
      founded: data.founded ? String(data.founded) : null,
      // Ensure project_needs is an array if it exists
      project_needs: Array.isArray(data.project_needs) ? data.project_needs : 
                    (data.project_needs ? [data.project_needs] : [])
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
      // And ensure project_needs is properly formatted for the database
      const dbData = {
        ...initialData,
        id: userId,
        founded: initialData.founded ? parseInt(initialData.founded, 10) : null,
        project_needs: initialData.project_needs || []
      };
      
      // Cast to unknown first to bypass type checking since we're doing manual conversion
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(dbData as unknown as any);
      
      if (insertError) throw insertError;
    } else if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};
