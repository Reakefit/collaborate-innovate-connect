
import { supabase } from '@/lib/supabase';
import { TeamTask, TeamTaskStatus } from '@/types/database';
import { toast } from 'sonner';

export const fetchTeamTasks = async (
  teamId: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<TeamTask[]> => {
  try {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('team_tasks')
      .select('*')
      .eq('team_id', teamId);
    
    if (error) throw error;
    
    const formattedTeamTasks: TeamTask[] = data.map(task => ({
      id: task.id,
      team_id: task.team_id,
      title: task.title,
      description: task.description,
      status: task.status as TeamTaskStatus,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      created_by: task.created_by,
      created_at: task.created_at,
      updated_at: task.updated_at
    }));
    
    return formattedTeamTasks;
  } catch (error: any) {
    setError(error.message);
    console.error('Error fetching team tasks:', error);
    return [];
  } finally {
    setLoading(false);
  }
};

export const createTeamTask = async (
  teamId: string, 
  taskData: any,
  user: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<TeamTask | null> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to create a team task');
    }
    
    const { data, error } = await supabase
      .from('team_tasks')
      .insert({
        team_id: teamId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        due_date: taskData.due_date || null,
        assigned_to: taskData.assigned_to || null,
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newTeamTask: TeamTask = {
      id: data.id,
      team_id: data.team_id,
      title: data.title,
      description: data.description || '',
      status: data.status as TeamTaskStatus,
      due_date: data.due_date || null,
      assigned_to: data.assigned_to || null,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    toast.success('Task created successfully!');
    return newTeamTask;
  } catch (error: any) {
    setError(error.message);
    console.error('Error creating team task:', error);
    toast.error('Failed to create task.');
    return null;
  } finally {
    setLoading(false);
  }
};

export const updateTeamTask = async (
  teamId: string, 
  taskId: string, 
  taskData: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('team_tasks')
      .update({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        due_date: taskData.due_date || null,
        assigned_to: taskData.assigned_to || null
      })
      .eq('id', taskId)
      .eq('team_id', teamId);

    if (error) throw error;
    
    toast.success('Task updated successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error updating team task:', error);
    toast.error('Failed to update task.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const deleteTeamTask = async (
  teamId: string, 
  taskId: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('team_tasks')
      .delete()
      .eq('id', taskId)
      .eq('team_id', teamId);
    
    if (error) throw error;
    
    toast.success('Task deleted successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error deleting team task:', error);
    toast.error('Failed to delete task.');
    return false;
  } finally {
    setLoading(false);
  }
};
