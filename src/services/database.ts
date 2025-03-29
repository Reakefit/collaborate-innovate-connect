import { supabase } from '@/lib/supabase';
import { 
  Project, Application, ProjectMilestone, ProjectTask, 
  ProjectMessage, ProjectReview, TeamTask, TeamMessage 
} from '@/types/database';

// Function to fetch project messages
export const fetchProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  const { data, error } = await supabase
    .from('project_messages')
    .select(`
      *,
      sender:profiles(name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching project messages:', error);
    return [];
  }

  return data || [];
};

// Function to fetch team messages
export const fetchTeamMessages = async (teamId: string): Promise<TeamMessage[]> => {
  const { data, error } = await supabase
    .from('team_messages')
    .select(`
      *,
      sender:profiles(name)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching team messages:', error);
    return [];
  }

  return data || [];
};

// Add more database service functions as needed
