
import { supabase } from '@/lib/supabase';
import { Project, ProjectMilestone, ProjectTask, MilestoneStatus, TaskStatus } from '@/types/database';

export const getTaskCompletion = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;

    const totalTasks = data.length;
    const completedTasks = data.filter(task => 
      task.completed || task.status === 'completed'
    ).length;

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting task completion:', error);
    return { totalTasks: 0, completedTasks: 0, completionRate: 0 };
  }
};

export const updateMilestoneProgress = async (milestoneId: string) => {
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('milestone_id', milestoneId);

    if (tasksError) throw tasksError;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => 
      task.completed || (task.status && task.status === 'completed')
    ).length;

    const progressValue = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // No need to modify the actual DB schema, just include progress in our UI calculations
    const milestoneUpdate = {
      // Don't include progress in the DB update
      // Instead, we'll calculate it on the fly when needed
    };

    if (Object.keys(milestoneUpdate).length > 0) {
      const { error: updateError } = await supabase
        .from('milestones')
        .update(milestoneUpdate)
        .eq('id', milestoneId);

      if (updateError) throw updateError;
    }

    return { progress: progressValue };
  } catch (error) {
    console.error('Error updating milestone progress:', error);
    throw error;
  }
};

export const updateProjectProgress = async (projectId: string) => {
  try {
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (milestonesError) throw milestonesError;

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (tasksError) throw tasksError;

    // Calculate overall progress
    const totalTasks = tasks.length;
    let completedTasks = 0;

    // Count completed tasks with type safety
    for (const task of tasks) {
      if (task.completed || (task.status && task.status === 'completed')) {
        completedTasks++;
      }
    }

    const progressValue = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // No need to modify the actual DB schema, just include progress in our UI calculations
    return { progress: progressValue };
  } catch (error) {
    console.error('Error updating project progress:', error);
    throw error;
  }
};

export const getProjectProgressDetails = async (projectId: string) => {
  try {
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (milestonesError) throw milestonesError;

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (tasksError) throw tasksError;

    // Calculate milestone progress
    const milestoneProgress = milestones.map(milestone => {
      const milestoneTasks = tasks.filter(task => task.milestone_id === milestone.id);
      const totalTasks = milestoneTasks.length;
      const completedTasks = milestoneTasks.filter(task => 
        task.completed || (task.status && task.status === 'completed')
      ).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...milestone,
        progress,
        totalTasks,
        completedTasks
      };
    });

    // Overall project progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => 
      task.completed || (task.status && task.status === 'completed')
    ).length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      milestones: milestoneProgress,
      overallProgress,
      totalTasks,
      completedTasks
    };
  } catch (error) {
    console.error('Error getting project progress details:', error);
    throw error;
  }
};
