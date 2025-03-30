
import { supabase } from '@/lib/supabase';
import { 
  Project, Application, ProjectMilestone, ProjectTask, 
  ProjectMessage, ProjectReview, TeamTask, TeamMessage, Team, TeamMember, TeamTaskStatus
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

  return (data || []).map(msg => {
    // Handle msg.sender carefully with null checking
    const senderName = msg.sender && 
                      typeof msg.sender === 'object' && 
                      'name' in msg.sender && 
                      msg.sender.name !== null ? 
                      msg.sender.name : 'Unknown User';
    
    return {
      ...msg,
      sender: { name: senderName }
    };
  });
};

// Function to fetch team messages
export const fetchTeamMessages = async (teamId: string): Promise<TeamMessage[]> => {
  const { data, error } = await supabase
    .from('team_messages')
    .select(`
      *,
      sender:profiles(name, avatar_url)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching team messages:', error);
    return [];
  }

  return (data || []).map(msg => {
    // Safely access the sender properties with null checks
    const senderName = msg.sender && 
                      typeof msg.sender === 'object' && 
                      'name' in msg.sender && 
                      msg.sender.name !== null ? 
                      msg.sender.name : 'Unknown User';
    
    const senderAvatar = msg.sender && 
                        typeof msg.sender === 'object' && 
                        'avatar_url' in msg.sender && 
                        msg.sender.avatar_url !== null ? 
                        msg.sender.avatar_url : '';
    
    return {
      ...msg,
      sender: {
        name: senderName,
        avatar_url: senderAvatar
      }
    };
  });
};

// Function to fetch team by ID
export const fetchTeamById = async (teamId: string): Promise<Team | null> => {
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      members:team_members(
        *,
        user:profiles(name)
      )
    `)
    .eq('id', teamId)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return null;
  }

  if (team) {
    const typedMembers: TeamMember[] = (team.members || []).map((member: any) => ({
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role,
      status: member.status,
      joined_at: member.joined_at,
      name: member.user?.name || 'Unknown User',
      user: member.user,
    }));

    return {
      ...team,
      skills: team.skills || [],
      members: typedMembers,
    };
  }

  return null;
};

// Function to fetch team tasks
export const fetchTeamTasks = async (teamId: string): Promise<TeamTask[]> => {
  const { data, error } = await supabase
    .from('team_tasks')
    .select(`
      *,
      assigned_to_profile:profiles(name)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching team tasks:', error);
    return [];
  }

  return (data || []).map(task => {
    // Completely rewritten null check for assigned_to_profile to be more thorough
    let assignedToName = 'Unassigned';
    
    if (task.assigned_to_profile !== null && 
        task.assigned_to_profile !== undefined) {
        
      if (typeof task.assigned_to_profile === 'object' && 
          task.assigned_to_profile !== null &&
          'name' in task.assigned_to_profile &&
          task.assigned_to_profile.name !== null && 
          task.assigned_to_profile.name !== undefined) {
            
        assignedToName = task.assigned_to_profile.name;
      }
    }

    return {
      id: task.id,
      team_id: task.team_id,
      title: task.title,
      description: task.description || '',
      status: (task.status === 'done' ? 'completed' : task.status) as TeamTaskStatus,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      created_by: task.created_by,
      created_at: task.created_at,
      updated_at: task.updated_at,
      assigned_to_profile: { name: assignedToName }
    };
  });
};
