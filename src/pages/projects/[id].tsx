import React from 'react';
import { ProjectTask, TaskStatus } from '@/types/database';

interface TaskItemProps {
  task: ProjectTask;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const TaskItem = ({ task, onStatusChange }: TaskItemProps) => {
  // Add a status field if it doesn't exist
  const taskWithStatus = {
    ...task,
    status: task.status || (task.completed ? 'completed' as TaskStatus : 'not_started' as TaskStatus),
    description: task.description || '',
    due_date: task.due_date || ''
  };

  // Now we can safely use properties from the enhanced task
  return (
    <div className="border p-4 rounded-lg mb-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{taskWithStatus.title}</h3>
          <p className="text-sm text-muted-foreground">{taskWithStatus.description}</p>
          {taskWithStatus.due_date && (
            <p className="text-xs text-muted-foreground mt-1">
              Due: {new Date(taskWithStatus.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div>
          <select 
            value={taskWithStatus.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className={`px-2 py-1 rounded text-xs ${
              taskWithStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
              taskWithStatus.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              taskWithStatus.status === 'blocked' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
