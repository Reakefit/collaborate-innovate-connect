import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Milestone = Tables['milestones']['Row'];
type Task = Tables['tasks']['Row'];

export const progressService = {
  async calculateProjectProgress(projectId: string): Promise<number> {
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (milestonesError) throw milestonesError;
    if (!milestones?.length) return 0;

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;

    return Math.round((completedMilestones / totalMilestones) * 100);
  },

  async updateMilestoneProgress(milestoneId: string): Promise<void> {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('milestone_id', milestoneId);

    if (tasksError) throw tasksError;
    if (!tasks?.length) return;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const progress = Math.round((completedTasks / totalTasks) * 100);

    const { error: updateError } = await supabase
      .from('milestones')
      .update({ progress })
      .eq('id', milestoneId);

    if (updateError) throw updateError;
  },

  async updateProjectProgress(projectId: string): Promise<void> {
    const progress = await this.calculateProjectProgress(projectId);

    const { error } = await supabase
      .from('projects')
      .update({ progress })
      .eq('id', projectId);

    if (error) throw error;
  },

  async getMilestoneProgress(milestoneId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
  }> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('milestone_id', milestoneId);

    if (error) throw error;
    if (!tasks?.length) return { total: 0, completed: 0, inProgress: 0, blocked: 0 };

    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };
  },

  async getProjectProgress(projectId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
  }> {
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    if (!milestones?.length) return { total: 0, completed: 0, inProgress: 0, blocked: 0 };

    return {
      total: milestones.length,
      completed: milestones.filter(m => m.status === 'completed').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      blocked: milestones.filter(m => m.status === 'blocked').length
    };
  }
}; 