import { Project, ProjectMilestone, ProjectTask, TaskStatus } from '@/types/database';

// Update any references to ProjectStatus to use string instead
export const calculateProjectProgress = (project: Project): number => {
  if (!project.milestones || project.milestones.length === 0) {
    return 0;
  }

  let totalMilestones = project.milestones.length;
  let completedMilestones = 0;

  for (const milestone of project.milestones) {
    if (milestone.status === 'completed') {
      completedMilestones++;
    }
  }

  return (completedMilestones / totalMilestones) * 100;
};

export const calculateMilestoneProgress = (milestone: ProjectMilestone): number => {
  if (!milestone.tasks || milestone.tasks.length === 0) {
    return 0;
  }

  let totalTasks = milestone.tasks.length;
  let completedTasks = 0;

  for (const task of milestone.tasks) {
    if (task.status === 'completed') {
      completedTasks++;
    }
  }

  return (completedTasks / totalTasks) * 100;
};

export const calculateTaskCompletion = (task: ProjectTask): number => {
  //If task is completed, return 100, else return 0
  return task.status === 'completed' ? 100 : 0;
};

// Fix the task status comparison
export const getTaskStatusWeight = (status: TaskStatus): number => {
  switch (status) {
    case 'completed':
      return 1.0;
    case 'review':
      return 0.9;
    case 'in_progress':
      return 0.5;
    case 'todo':
    case 'blocked':
    default:
      return 0;
  }
};
