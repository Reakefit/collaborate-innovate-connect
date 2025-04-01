
import { Project, ProjectMilestone, ProjectTask, TaskStatus } from "@/types/database";

export const calculateProjectProgress = (project: Project): number => {
  if (!project.milestones || project.milestones.length === 0) {
    return 0;
  }

  // Calculate total milestones and completed milestones
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(
    milestone => milestone.status === 'completed'
  ).length;

  return Math.round((completedMilestones / totalMilestones) * 100);
};

export const calculateMilestoneProgress = (milestone: ProjectMilestone): number => {
  if (!milestone.tasks || milestone.tasks.length === 0) {
    return 0;
  }

  // Calculate total tasks and completed tasks
  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter(
    task => task.status === 'done' || task.status === 'completed'
  ).length;

  return Math.round((completedTasks / totalTasks) * 100);
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'done':
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'review':
      return 'bg-yellow-500';
    case 'blocked':
      return 'bg-red-500';
    case 'todo':
    default:
      return 'bg-gray-300';
  }
};

export const getTaskStatusText = (status: TaskStatus): string => {
  switch (status) {
    case 'done':
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'review':
      return 'In Review';
    case 'blocked':
      return 'Blocked';
    case 'todo':
    default:
      return 'To Do';
  }
};
