
import { supabase } from "@/lib/supabase";
import { ProjectTask, ProjectMilestone, Project, TaskStatus, MilestoneStatus } from "@/types/database";
import { updateTaskStatus } from './database';

// Calculate progress percentages for projects, milestones, and tasks
export const calculateTaskProgress = (task: ProjectTask): number => {
  if (task.status === 'completed') return 100;
  if (task.status === 'in_progress') return 50;
  if (task.status === 'blocked') return 25;
  return 0; // not_started
};

export const calculateMilestoneProgress = (milestone: ProjectMilestone): number => {
  if (!milestone.tasks || milestone.tasks.length === 0) {
    // No tasks, base progress on milestone status
    if (milestone.status === 'completed') return 100;
    if (milestone.status === 'in_progress') return 50;
    if (milestone.status === 'delayed') return 25;
    return 0; // not_started
  }

  // Calculate based on tasks
  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter(task => 
    task.status === 'completed'
  ).length;
  
  return Math.round((completedTasks / totalTasks) * 100);
};

export const calculateProjectProgress = (project: Project): number => {
  if (!project.milestones || project.milestones.length === 0) {
    // No milestones, return a default progress based on project status
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress') return 50;
    if (project.status === 'cancelled') return 0;
    return 10; // open but not started
  }

  // Calculate based on milestones
  const totalMilestones = project.milestones.length;
  let totalProgress = 0;

  project.milestones.forEach(milestone => {
    totalProgress += calculateMilestoneProgress(milestone);
  });

  return Math.round(totalProgress / totalMilestones);
};

// Update task status
export const updateTask = async (taskId: string, status: TaskStatus): Promise<boolean> => {
  try {
    const { error } = await updateTaskStatus(taskId, status);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    return false;
  }
};

// Update milestone status
export const updateMilestone = async (milestoneId: string, status: MilestoneStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_milestones')
      .update({ status })
      .eq('id', milestoneId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating milestone status:', error);
    return false;
  }
};

// Auto-update milestone status based on tasks completion
export const updateMilestoneFromTasks = async (milestoneId: string): Promise<boolean> => {
  try {
    // First get all tasks for this milestone
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('milestone_id', milestoneId);
    
    if (tasksError) throw tasksError;
    
    if (tasks.length === 0) return true; // No tasks, nothing to update
    
    // Calculate completion percentage
    const completedTasks = tasks.filter(task => 
      task.status === 'completed'
    ).length;
    
    const completionPercentage = (completedTasks / tasks.length) * 100;
    
    // Determine new status based on completion
    let newStatus: MilestoneStatus = 'not_started';
    
    if (completionPercentage === 100) {
      newStatus = 'completed';
    } else if (completionPercentage > 0) {
      newStatus = 'in_progress';
    }
    
    // Has any blocked tasks?
    const hasBlocked = tasks.some(task => 
      task.status === 'blocked'
    );
    
    if (hasBlocked && newStatus !== 'completed') {
      newStatus = 'delayed';
    }
    
    // Update milestone status
    const { error } = await supabase
      .from('project_milestones')
      .update({ status: newStatus })
      .eq('id', milestoneId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating milestone from tasks:', error);
    return false;
  }
};

// Auto-update project status based on milestones completion
export const updateProjectFromMilestones = async (projectId: string): Promise<boolean> => {
  try {
    // First get all milestones for this project
    const { data: milestones, error: milestonesError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId);
    
    if (milestonesError) throw milestonesError;
    
    if (milestones.length === 0) return true; // No milestones, nothing to update
    
    // Calculate completion percentage
    const completedMilestones = milestones.filter(milestone => 
      milestone.status === 'completed'
    ).length;
    
    const completionPercentage = (completedMilestones / milestones.length) * 100;
    
    // Determine new status based on completion
    let newStatus: ProjectStatus = 'open';
    
    if (completionPercentage === 100) {
      newStatus = 'completed';
    } else if (completionPercentage > 0) {
      newStatus = 'in_progress';
    }
    
    // Update project status
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating project from milestones:', error);
    return false;
  }
};
