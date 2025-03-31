
import { supabase } from '@/lib/supabase';
import { Project, Application, ProjectMessage, Team, TeamMember, Profile } from '@/types/database';

// Fetch all projects from the database
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;
    
    return data as Project[];
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
    
    return data as Project;
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
    
    return data as Application[];
  } catch (error) {
    console.error('Error fetching applications:', error);
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
    
    return data as Application[];
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
    
    return data as TeamMember[];
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
    
    return data as Profile;
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
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...initialData
        });
      
      if (insertError) throw insertError;
    } else if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};
