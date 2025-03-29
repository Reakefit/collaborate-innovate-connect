
import { supabase } from "@/lib/supabase";
import { 
  Project, Team, Application, ProjectMilestone, ProjectTask, 
  ProjectMessage, ProjectReview, TeamTask, TeamMessage, TaskStatus,
  ApplicationStatus, MilestoneStatus, ProjectStatus
} from "@/types/database";

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  project_id: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

// Helper to add status field to tasks if missing
const addStatusToTask = (task: any): any => {
  if (!task.status) {
    return {
      ...task,
      status: task.completed ? 'completed' as TaskStatus : 'not_started' as TaskStatus
    };
  }
  return task;
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        applications (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process the data to match the Project type
    return (data || []).map((project: any) => ({
      ...project,
      applications: project.applications || []
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        applications (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Process the data to match the Project type
    return {
      ...data,
      applications: data.applications || []
    } as unknown as Project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

export const fetchProjectMilestones = async (projectId: string): Promise<ProjectMilestone[]> => {
  try {
    const { data, error } = await supabase
      .from('project_milestones')
      .select(`
        *,
        tasks:project_tasks (*)
      `)
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Process the data to match the ProjectMilestone type
    return (data || []).map((milestone: any) => ({
      ...milestone,
      tasks: milestone.tasks ? milestone.tasks.map(addStatusToTask) : []
    })) as unknown as ProjectMilestone[];
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    return [];
  }
};

export const fetchMilestoneById = async (id: string): Promise<ProjectMilestone | null> => {
  try {
    const { data, error } = await supabase
      .from('project_milestones')
      .select(`
        *,
        tasks:project_tasks (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Process the data to match the ProjectMilestone type
    return {
      ...data,
      tasks: data.tasks ? data.tasks.map(addStatusToTask) : []
    } as unknown as ProjectMilestone;
  } catch (error) {
    console.error('Error fetching milestone:', error);
    return null;
  }
};

export const fetchProjectTasks = async (projectId: string): Promise<ProjectTask[]> => {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Process the data to match the ProjectTask type
    return (data || []).map(addStatusToTask) as unknown as ProjectTask[];
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return [];
  }
};

export const fetchTaskById = async (id: string): Promise<ProjectTask | null> => {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Process the data to match the ProjectTask type
    return addStatusToTask(data) as unknown as ProjectTask;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};

export const fetchProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        sender:profiles!sender_id (
          name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data as unknown as ProjectMessage[];
  } catch (error) {
    console.error('Error fetching project messages:', error);
    return [];
  }
};

export const fetchProjectReviews = async (projectId: string): Promise<ProjectReview[]> => {
  try {
    const { data, error } = await supabase
      .from('project_feedback')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as unknown as ProjectReview[];
  } catch (error) {
    console.error('Error fetching project reviews:', error);
    return [];
  }
};

export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members (
          id,
          user_id,
          role,
          status,
          user:profiles!user_id (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as unknown as Team[];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

export const fetchTeamById = async (id: string): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members (
          id,
          user_id,
          role,
          status,
          user:profiles!user_id (
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as Team;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
};

export const fetchTeamTasks = async (teamId: string): Promise<TeamTask[]> => {
  try {
    const { data, error } = await supabase
      .from('team_tasks')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as unknown as TeamTask[];
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    return [];
  }
};

export const fetchTeamMessages = async (teamId: string): Promise<TeamMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('team_messages')
      .select(`
        *,
        sender:profiles!sender_id (
          name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as unknown as TeamMessage[];
  } catch (error) {
    console.error('Error fetching team messages:', error);
    return [];
  }
};

export const fetchApplications = async (): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as unknown as Application[];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

export const fetchApplicationById = async (id: string): Promise<Application | null> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as Application;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
};

export const fetchProjectApplications = async (projectId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        team:teams (
          id,
          name,
          description,
          lead_id,
          skills,
          members:team_members (
            id,
            user_id,
            role,
            status,
            user:profiles!user_id (
              name
            )
          )
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as unknown as Application[];
  } catch (error) {
    console.error('Error fetching project applications:', error);
    return [];
  }
};

export const createTeamInvite = async (teamId: string, email: string, expiry = 7) => {
  try {
    // This would need a custom table for team invites
    // For now, just return a mocked response
    console.log(`Creating team invite for team ${teamId} to email ${email} with expiry ${expiry} days`);
    
    return {
      id: 'mock-invite-id',
      team_id: teamId,
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      expires_at: new Date(Date.now() + expiry * 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error creating team invite:', error);
    return null;
  }
};

export const validateTeamInvite = async (code: string) => {
  try {
    // This would need a custom table for team invites
    console.log(`Validating team invite with code ${code}`);
    
    // Mocked response for now
    return {
      id: 'mock-invite-id',
      team_id: 'mock-team-id',
      code,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error validating team invite:', error);
    return null;
  }
};

export const acceptTeamInvite = async (code: string, userId: string) => {
  try {
    // Validate the invite first
    const invite = await validateTeamInvite(code);
    if (!invite) {
      throw new Error('Invalid or expired invite');
    }
    
    // Add user to team
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: invite.team_id,
        user_id: userId,
        role: 'member',
        status: 'active'
      });
    
    if (error) throw error;
    
    // In a real implementation, you would delete the invite after use
    console.log(`Deleting invite with ID ${invite.id}`);
    
    return true;
  } catch (error) {
    console.error('Error accepting team invite:', error);
    return false;
  }
};

export const submitApplication = async (projectId: string, teamId: string, coverLetter: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        project_id: projectId,
        team_id: teamId,
        cover_letter: coverLetter,
        status: 'pending',
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as unknown as Application;
  } catch (error) {
    console.error('Error submitting application:', error);
    return null;
  }
};

export const addTeamMember = async (applicationId: string, userId: string, role: string) => {
  try {
    // In a real app, you would add validation to ensure this is authorized
    console.log(`Adding team member ${userId} to application ${applicationId} with role ${role}`);
    
    // This is a mocked response because we need more context about the data structure
    return true;
  } catch (error) {
    console.error('Error adding team member:', error);
    return false;
  }
};

// Helper for adding status to tasks in project service code
export const updateTaskStatus = (taskId: string, status: TaskStatus) => {
  return supabase
    .from('project_tasks')
    .update({ status })
    .eq('id', taskId);
};
