import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDashboard from '@/components/layouts/ProjectDashboard';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Clock, 
  Users, 
  MessageSquare, 
  CheckSquare,
  AlertCircle,
  Plus,
  Edit,
  Trash,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
type TaskStatus = 'todo' | 'in_progress' | 'done' | 'review';

interface MilestoneInput {
  title: string;
  description: string;
  due_date: string;
}

interface TaskInput {
  title: string;
  description: string;
  due_date: string;
  assigned_to: string;
  status: TaskStatus;
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProjectStatus, createMilestone, updateMilestone, createTask, updateTask, sendMessage } = useProjects();
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [newMilestone, setNewMilestone] = useState<MilestoneInput>({ title: '', description: '', due_date: '' });
  const [newTask, setNewTask] = useState<TaskInput>({ 
    title: '', 
    description: '', 
    due_date: '', 
    assigned_to: '',
    status: 'todo'
  });

  const project = projects.find(p => p.id === id);
  if (!project) {
    return (
      <ProjectDashboard>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The project you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </ProjectDashboard>
    );
  }

  const handleStatusUpdate = async (status: ProjectStatus) => {
    try {
      await updateProjectStatus(project.id, status);
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMilestone(project.id, newMilestone);
      setNewMilestone({ title: '', description: '', due_date: '' });
    } catch (error) {
      console.error('Failed to create milestone:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent, milestoneId: string) => {
    e.preventDefault();
    try {
      await createTask(milestoneId, newTask);
      setNewTask({ title: '', description: '', due_date: '', assigned_to: '', status: 'todo' });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(project.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <ProjectDashboard>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {new Date(project.start_date).toLocaleDateString()} -{' '}
                  {new Date(project.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>Team Size: {project.team_size}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {profile?.role === 'startup' && project.created_by === profile.id && (
              <>
                <button
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Project Status</h3>
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleStatusUpdate('open')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'open'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones & Tasks */}
        <div className="grid grid-cols-1 gap-6">
          {/* Milestones */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Milestones</h3>
                <button
                  onClick={() => document.getElementById('newMilestoneForm')?.classList.remove('hidden')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Milestone
                </button>
              </div>

              {/* New Milestone Form */}
              <form id="newMilestoneForm" className="hidden mt-4 space-y-4" onSubmit={handleCreateMilestone}>
                <div>
                  <label htmlFor="milestoneTitle" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="milestoneTitle"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="milestoneDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="milestoneDescription"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="milestoneDueDate" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="milestoneDueDate"
                    value={newMilestone.due_date}
                    onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('newMilestoneForm')?.classList.add('hidden')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create
                  </button>
                </div>
              </form>

              {/* Milestones List */}
              <div className="mt-6 space-y-4">
                {project.milestones?.map((milestone) => (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Due {new Date(milestone.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          milestone.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : milestone.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {milestone.status}
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-900">Tasks</h5>
                        <button
                          onClick={() => document.getElementById(`newTaskForm-${milestone.id}`)?.classList.remove('hidden')}
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          <Plus className="h-4 w-4 inline-block mr-1" />
                          Add Task
                        </button>
                      </div>

                      {/* New Task Form */}
                      <form
                        id={`newTaskForm-${milestone.id}`}
                        className="hidden mt-2 space-y-2"
                        onSubmit={(e) => handleCreateTask(e, milestone.id)}
                      >
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Task title"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                        <textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Task description"
                          rows={2}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <select
                            value={newTask.assigned_to}
                            onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="">Assign to...</option>
                            {/* Add team members here */}
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById(`newTaskForm-${milestone.id}`)?.classList.add('hidden')}
                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Add
                          </button>
                        </div>
                      </form>

                      {/* Tasks List */}
                      <ul className="mt-2 space-y-2">
                        {milestone.tasks?.map((task) => (
                          <li key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={task.status === 'done'}
                                onChange={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                <p className="text-sm text-gray-500">{task.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  task.status === 'done'
                                    ? 'bg-green-100 text-green-800'
                                    : task.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProjectDashboard>
  );
};

export default ProjectDetailPage; 