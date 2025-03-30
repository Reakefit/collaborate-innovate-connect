
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Project,
  Team,
  TeamTask,
  TeamMember,
  TeamTaskStatus,
} from '@/types/database';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

const TeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { teams, fetchTeams, updateTeamTask, deleteTeamTask } = useProject();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [selectedTask, setSelectedTask] = useState<TeamTask | null>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState<Date | null>(null);
  const [editTaskAssignedTo, setEditTaskAssignedTo] = useState('');
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);

  useEffect(() => {
    const loadTeam = async () => {
      if (teams.length === 0) {
        await fetchTeams();
      }

      const foundTeam = teams.find((t) => t.id === id) || null;
      setTeam(foundTeam);
    };

    loadTeam();
  }, [id, teams, fetchTeams]);

  if (!team) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Team Not Found</h2>
          <p className="text-muted-foreground">
            The team you're looking for doesn't exist or is still loading.
          </p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </div>
    );
  }

  const handleCreateTask = async () => {
    // Implement the create task logic here
    setShowCreateTaskModal(false);
    toast.success('Task created successfully!');
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: TeamTaskStatus
  ) => {
    try {
      await updateTeamTask(taskId, { status });
      toast.success('Task status updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error updating task status');
    }
  };

  const handleEditTask = (task: TeamTask) => {
    setSelectedTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description);
    setEditTaskDueDate(task.due_date ? new Date(task.due_date) : null);
    setEditTaskAssignedTo(task.assigned_to || '');
    setShowEditTaskModal(true);
  };

  const handleUpdateEditedTask = async () => {
    if (!selectedTask) return;

    try {
      await updateTeamTask(selectedTask.id, {
        title: editTaskTitle,
        description: editTaskDescription,
        due_date: editTaskDueDate ? editTaskDueDate.toISOString() : null,
        assigned_to: editTaskAssignedTo,
      });
      setShowEditTaskModal(false);
      toast.success('Task updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error updating task');
    }
  };

  const handleDeleteTask = (task: TeamTask) => {
    setSelectedTask(task);
    setShowDeleteTaskModal(true);
  };

  const handleConfirmDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await deleteTeamTask(selectedTask.id);
      setShowDeleteTaskModal(false);
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error deleting task');
    }
  };

  const getTaskStatusColor = (status: string) => {
    if (status === 'completed' || status === 'done') {
      return 'bg-green-500';
    } else if (status === 'in_progress') {
      return 'bg-blue-500';
    } else if (status === 'blocked') {
      return 'bg-red-500';
    } else {
      return 'bg-gray-300';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/teams')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
        <h1 className="text-3xl font-bold">{team.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {team.members && team.members.length > 0 ? (
                team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{member.name}</span>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No members in this team yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {team.description || 'No description provided.'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Message Team
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Team Tasks</h2>
          <Button onClick={() => setShowCreateTaskModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {team?.tasks && team.tasks.length > 0 ? (
          <div className="space-y-4">
            {team.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 ${getTaskStatusColor(
                      task.status
                    )}`}
                  />
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.due_date && (
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={task.status}
                    onValueChange={(value) =>
                      handleUpdateTaskStatus(task.id, value as TeamTaskStatus)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTask(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTask(task)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tasks Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Create tasks to manage and track team activities.
              </p>
              <Button onClick={() => setShowCreateTaskModal(true)} className="mt-4">
                Add First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Task Modal */}
      <Dialog open={showCreateTaskModal} onOpenChange={setShowCreateTaskModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task for the team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                onChange={(e) =>
                  setNewTaskDueDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                placeholder="Enter user ID or email"
                value={newTaskAssignedTo}
                onChange={(e) => setNewTaskAssignedTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={showEditTaskModal} onOpenChange={setShowEditTaskModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Edit the details of the selected task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                placeholder="Enter task title"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                placeholder="Enter task description"
                value={editTaskDescription}
                onChange={(e) => setEditTaskDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDueDate">Due Date</Label>
              <Input
                type="date"
                id="editDueDate"
                onChange={(e) =>
                  setEditTaskDueDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAssignedTo">Assigned To</Label>
              <Input
                id="editAssignedTo"
                placeholder="Enter user ID or email"
                value={editTaskAssignedTo}
                onChange={(e) => setEditTaskAssignedTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEditedTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Modal */}
      <Dialog open={showDeleteTaskModal} onOpenChange={setShowDeleteTaskModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTaskModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamPage;
