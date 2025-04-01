import { supabase } from '@/lib/supabase';
import { Application, ApplicationStatus, ProjectMessage } from '@/types/database';

/**
 * Fetches project messages
 * @param projectId Project ID to filter messages
 * @returns Promise with array of project messages
 */
export const fetchProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        sender:user_profiles(name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching project messages:', error);
      throw error;
    }

    // Format the messages with sender data
    return (data || []).map(message => ({
      id: message.id,
      project_id: message.project_id,
      content: message.content,
      sender_id: message.sender_id,
      created_at: message.created_at,
      sender: message.sender ? {
        name: message.sender.name
      } : undefined
    }));
  } catch (error) {
    console.error('Error in fetchProjectMessages:', error);
    return [];
  }
};

/**
 * Fetches applications with associated team details
 * @param projectId Optional project ID to filter applications
 * @returns Promise with array of applications with team details
 */
export const fetchApplicationsWithTeams = async (projectId?: string): Promise<Application[]> => {
  try {
    let query = supabase
      .from('applications')
      .select(`
        *,
        team:teams(*)
      `);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching applications with teams:', error);
      throw error;
    }
    
    // Format the applications with team data
    return (data || []).map((app) => ({
      id: app.id,
      project_id: app.project_id,
      user_id: app.user_id,
      team_id: app.team_id,
      status: app.status as ApplicationStatus,
      cover_letter: app.cover_letter,
      created_at: app.created_at,
      updated_at: app.updated_at,
      team: app.team ? {
        id: app.team.id,
        name: app.team.name,
        description: app.team.description || '',
        lead_id: app.team.lead_id,
        skills: app.team.skills || [],
        portfolio_url: app.team.portfolio_url || null,
        achievements: app.team.achievements || null,
        created_at: app.team.created_at,
        updated_at: app.team.updated_at
      } : undefined
    }));
  } catch (error) {
    console.error('Error in fetchApplicationsWithTeams:', error);
    return [];
  }
};
