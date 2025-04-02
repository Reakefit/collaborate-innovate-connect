
import { supabase } from '@/lib/supabase';
import { TaskStatus } from '@/types/database';
import { toast } from 'sonner';

export const addTask = async (
  projectId: string, 
  milestoneId: string, 
  taskData: any,
  user: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to add a task');
    }
    
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        milestone_id: milestoneId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        assigned_to: taskData.assigned_to || null,
        created_by: user.id,
        due_date: taskData.due_date || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Task added successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error adding task:', error);
    toast.error('Failed to add task.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const updateTaskStatus = async (
  taskId: string, 
  status: TaskStatus,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('project_tasks')
      .update({ status })
      .eq('id', taskId);
    
    if (error) throw error;
    
    toast.success('Task status updated successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error updating task status:', error);
    toast.error('Failed to update task status.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const addMilestone = async (
  projectId: string, 
  milestoneData: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('project_milestones')
      .insert({
        project_id: projectId,
        title: milestoneData.title,
        description: milestoneData.description || null,
        due_date: milestoneData.due_date,
        status: milestoneData.status || 'not_started'
      });
    
    if (error) throw error;
    
    toast.success('Milestone added successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error adding milestone:', error);
    toast.error('Failed to add milestone.');
    return false;
  } finally {
    setLoading(false);
  }
};
