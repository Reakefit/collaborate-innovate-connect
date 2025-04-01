
import { Task, TaskStatus } from '@/types/database';

// Calculate progress percentage for tasks
export const calculateTaskProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => 
    task.status === 'completed' || 
    task.status === 'done'
  ).length;
  
  return Math.round((completedTasks / tasks.length) * 100);
};

// Calculate task status counts
export const calculateTaskStatusCounts = (tasks: Task[]) => {
  if (!tasks) return { todo: 0, inProgress: 0, completed: 0, blocked: 0, review: 0 };
  
  return tasks.reduce((counts, task) => {
    if (task.status === 'todo') counts.todo++;
    else if (task.status === 'in_progress') counts.inProgress++;
    else if (task.status === 'completed' || task.status === 'done') counts.completed++;
    else if (task.status === 'blocked') counts.blocked++;
    else if (task.status === 'review') counts.review++;
    return counts;
  }, { todo: 0, inProgress: 0, completed: 0, blocked: 0, review: 0 });
};

// Get the appropriate color for a task status
export const getTaskStatusColor = (status: TaskStatus): string => {
  switch(status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed': 
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    case 'review':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get the background color for a task card based on status
export const getTaskCardColor = (status: TaskStatus): string => {
  switch(status) {
    case 'todo':
      return 'border-l-4 border-l-gray-400';
    case 'in_progress':
      return 'border-l-4 border-l-blue-400';
    case 'completed':
    case 'done':
      return 'border-l-4 border-l-green-400';
    case 'blocked':
      return 'border-l-4 border-l-red-400';
    case 'review':
      return 'border-l-4 border-l-amber-400';
    default:
      return 'border-l-4 border-l-gray-400';
  }
};
