
import { 
  Project, ProjectMilestone, ProjectTask, 
  MilestoneStatus, TaskStatus, ProjectStatus 
} from "@/types/database";

// Function to calculate project progress
export const calculateProjectProgress = (project: Project): number => {
  if (!project.milestones || project.milestones.length === 0) {
    return 0;
  }

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(
    milestone => milestone.status === 'completed'
  ).length;

  return Math.round((completedMilestones / totalMilestones) * 100);
};

// Function to calculate milestone progress based on tasks
export const calculateMilestoneProgress = (milestone: ProjectMilestone): number => {
  if (!milestone.tasks || milestone.tasks.length === 0) {
    return 0;
  }

  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter(
    task => task.status === 'completed'
  ).length;

  return Math.round((completedTasks / totalTasks) * 100);
};

// Function to get remaining days for a project or milestone
export const getRemainingDays = (endDate: string): number => {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Function to check if a project is overdue
export const isProjectOverdue = (project: Project): boolean => {
  return new Date(project.end_date) < new Date() && project.status !== 'completed';
};

// Function to check if a milestone is overdue
export const isMilestoneOverdue = (milestone: ProjectMilestone): boolean => {
  return milestone.due_date ? 
    new Date(milestone.due_date) < new Date() && milestone.status !== 'completed' 
    : false;
};

// Function to get project status badge color
export const getProjectStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Function to get milestone status badge color
export const getMilestoneStatusColor = (status: MilestoneStatus): string => {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'delayed':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Function to get task status badge color
export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'review':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
