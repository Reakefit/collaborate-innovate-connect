
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
    // Create a default sender object with "Unknown User" as the name
    const defaultSender = { name: 'Unknown User' };
    
    // Check if msg.sender exists and is a valid object
    let senderName = defaultSender.name;
    
    if (msg.sender && typeof msg.sender === 'object' && msg.sender !== null) {
      // Now we know msg.sender is an object, not null
      const senderObj = msg.sender as Record<string, any>;
      
      // Check if it has a name property and the name is not null
      if ('name' in senderObj && senderObj.name !== null) {
        senderName = senderObj.name as string;
      }
    }
    
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
    // Create default values
    const defaultSender = { 
      name: 'Unknown User',
      avatar_url: ''
    };
    
    // Check if msg.sender exists and is a valid object
    let senderName = defaultSender.name;
    let senderAvatar = defaultSender.avatar_url;
    
    if (msg.sender && typeof msg.sender === 'object' && msg.sender !== null) {
      // Now we know msg.sender is an object, not null
      const senderObj = msg.sender as Record<string, any>;
      
      // Check if it has a name property and the name is not null
      if ('name' in senderObj && senderObj.name !== null) {
        senderName = senderObj.name as string;
      }
      
      // Check if it has an avatar_url property and the avatar_url is not null
      if ('avatar_url' in senderObj && senderObj.avatar_url !== null) {
        senderAvatar = senderObj.avatar_url as string;
      }
    }
    
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
    // Default value
    let assignedToName = 'Unassigned';
    
    // Proper null checking
    if (task.assigned_to_profile !== null && task.assigned_to_profile !== undefined) {
      if (typeof task.assigned_to_profile === 'object') {
        const profileObj = task.assigned_to_profile as Record<string, any> | null;
        
        if (profileObj && 'name' in profileObj && profileObj.name !== null && profileObj.name !== undefined) {
          assignedToName = profileObj.name as string;
        }
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
