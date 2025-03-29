import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Project, Application, ProjectMilestone, ProjectTask, 
  MilestoneStatus, TaskStatus, ProjectReview, ProjectResource
} from "@/types/database";
import { 
  fetchProjectById, fetchProjectApplications, fetchProjectMilestones, 
  fetchProjectTasks, fetchProjectReviews 
} from '@/services/database';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, applications, createApplication, updateApplication, createTask, updateTask, deleteTask, createMilestone, updateMilestone, deleteMilestone } = useProject();
  const [project, setProject] = useState<Project | null>(null);
  const [projectApplications, setProjectApplications] = useState<Application[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = React.useState<Date | undefined>(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = React.useState<Date | undefined>(new Date());
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [projectReviews, setProjectReviews] = useState<ProjectReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProjectDetails(id);
    }
  }, [id]);

  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    try {
      const project = await fetchProjectById(projectId);
      const applications = await fetchProjectApplications(projectId);
      const milestones = await fetchProjectMilestones(projectId);
      const tasks = await fetchProjectTasks(projectId);
      const reviews = await fetchProjectReviews(projectId);
      
      setProject(project);
      setProjectApplications(applications);
      setProjectMilestones(milestones);
      setProjectTasks(tasks);
      setProjectReviews(reviews);
    } catch (error: any) {
      setError(error.message || 'Failed to load project details');
      toast.error(error.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!project || !user || !profile) return;

    // Check if the user is already applied
    const alreadyApplied = project.applications?.some(app => app.user_id === user.id);
    if (alreadyApplied) {
      toast.error("You have already applied for this project.");
      return;
    }

    // Check if the user is the project creator
    if (project.created_by === user.id) {
      toast.error("You cannot apply for your own project.");
      return;
    }

    // Check if the user is a startup
    if (profile.role === 'startup') {
      toast.error("Startups cannot apply for projects.");
      return;
    }

    // Submit the application
    try {
      const coverLetter = prompt("Why do you want to join this project? (Write a short cover letter):");
      if (!coverLetter) return;

      const newApplication = await createApplication({
        project_id: project.id,
        team_id: '00000000-0000-0000-0000-000000000000',
        cover_letter: coverLetter,
        user_id: user.id,
        status: 'pending'
      });

      if (newApplication) {
        toast.success("Application submitted successfully!");
        loadProjectDetails(project.id);
      } else {
        toast.error("Failed to submit application.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application.");
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      await updateApplication(applicationId, 'accepted');
      toast.success("Application accepted successfully!");
      loadProjectDetails(project?.id || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to accept application.");
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await updateApplication(applicationId, 'rejected');
      toast.success("Application rejected successfully!");
      loadProjectDetails(project?.id || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to reject application.");
    }
  };

  const handleCreateMilestone = async () => {
    if (!project || !newMilestoneTitle || !newMilestoneDescription || !newMilestoneDueDate) return;

    try {
      const newMilestone = await createMilestone({
        project_id: project.id,
        title: newMilestoneTitle,
        description: newMilestoneDescription,
        due_date: newMilestoneDueDate.toISOString(),
        status: 'not_started'
      });

      if (newMilestone) {
        toast.success("Milestone created successfully!");
        setNewMilestoneTitle('');
        setNewMilestoneDescription('');
        setNewMilestoneDueDate(new Date());
        loadProjectDetails(project.id);
      } else {
        toast.error("Failed to create milestone.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create milestone.");
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus) => {
    try {
      await updateMilestone(milestoneId, { status: status });
      toast.success("Milestone status updated successfully!");
      loadProjectDetails(project?.id || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to update milestone status.");
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      toast.success("Milestone deleted successfully!");
      loadProjectDetails(project?.id || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete milestone.");
    }
  };

  const handleCreateTask = async () => {
    if (!project || !selectedMilestone || !newTaskTitle || !newTaskDescription || !newTaskDueDate) return;

    try {
      const newTask = await createTask({
        project_id: project.id,
        milestone_id: selectedMilestone,
        title: newTaskTitle,
        description: newTaskDescription,
        due_date: newTaskDueDate.toISOString(),
        status: 'not_started',
        assigned_to: user?.id
      });

      if (newTask) {
        toast.success("Task created successfully!");
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate(new Date());
        loadProjectDetails(project.id);
      } else {
        toast.error("Failed to create task.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create task.");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask(taskId, { status: status });
      toast.success("Task status updated successfully!");
      loadProjectDetails(project?.id || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
      loadProjectDetails(project?.id || '');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task.");
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading project details...</div>;
  }

  if (error || !project) {
    return <div className="container mx-auto py-8">Error: {error || 'Project not found'}</div>;
  }

  const isProjectOwner = user?.id === project.created_by;
  const hasApplied = projectApplications.some(app => app.user_id === user?.id);
  const isApplicationPending = projectApplications.some(app => app.user_id === user?.id && app.status === 'pending');

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-gray-500">{project.description}</p>
        </div>
        <div>
          {profile?.role === 'student' && !isProjectOwner && !hasApplied && (
            <Button onClick={handleApply}>Apply Now</Button>
          )}
          {profile?.role === 'student' && !isProjectOwner && hasApplied && isApplicationPending && (
            <Button disabled>Application Pending</Button>
          )}
          <Badge variant={project.status === 'in_progress' ? 'secondary' : 
        project.status === 'completed' ? 'outline' : 
        project.status === 'cancelled' ? 'destructive' : 'default'}>
  {project.status === 'open' ? 'Open' : 
   project.status === 'in_progress' ? 'In Progress' : 
   project.status === 'completed' ? 'Completed' : 'Cancelled'}
</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Information about the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <p>{project.category}</p>
            </div>
            <div className="space-y-2">
              <Label>Payment Model</Label>
              <p>{project.payment_model}</p>
            </div>
            <div className="space-y-2">
              <Label>Stipend Amount</Label>
              <p>{project.stipend_amount}</p>
            </div>
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <p>{project.required_skills.join(', ')}</p>
            </div>
            <div className="space-y-2">
              <Label>Team Size</Label>
              <p>{project.team_size}</p>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <p>{new Date(project.start_date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <p>{new Date(project.end_date).toLocaleDateString()}</p>
            </div>
            {project.deliverables && project.deliverables.length > 0 && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Deliverables</h3>
    <ul className="list-disc pl-5 space-y-1">
      {project.deliverables.map((deliverable, index) => (
        <li key={index}>{deliverable}</li>
      ))}
    </ul>
  </div>
)}
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>List of applications for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {projectApplications.length === 0 ? (
                <p className="text-sm text-gray-500">No applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {projectApplications.map(application => (
                    <Card key={application.id}>
                      <CardHeader className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle>{application.user_id}</CardTitle>
                          <CardDescription>
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {isProjectOwner && application.status === 'pending' && (
                          <div className="space-x-2">
                            <Button variant="secondary" size="sm" onClick={() => handleAcceptApplication(application.id)}>
                              Accept
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectApplication(application.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                        <Badge>{application.status}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{application.cover_letter}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Milestones */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Manage project milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {projectMilestones.length === 0 ? (
                <p className="text-sm text-gray-500">No milestones yet.</p>
              ) : (
                <div className="space-y-4">
                  {projectMilestones.map(milestone => (
                    <Card key={milestone.id}>
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle>{milestone.title}</CardTitle>
                        <div>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteMilestone(milestone.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{milestone.description}</p>
                        <p className="text-sm">Due Date: {new Date(milestone.due_date).toLocaleDateString()}</p>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateMilestoneStatus(milestone.id, 'not_started' as MilestoneStatus)}>
                            Not Started
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateMilestoneStatus(milestone.id, 'in_progress' as MilestoneStatus)}>
                            In Progress
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateMilestoneStatus(milestone.id, 'completed' as MilestoneStatus)}>
                            Completed
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateMilestoneStatus(milestone.id, 'delayed' as MilestoneStatus)}>
                            Delayed
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {isProjectOwner && (
            <CardFooter className="flex flex-col space-y-4">
              <CardTitle>Create New Milestone</CardTitle>
              <Input
                type="text"
                placeholder="Milestone Title"
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
              />
              <Textarea
                placeholder="Milestone Description"
                value={newMilestoneDescription}
                onChange={e => setNewMilestoneDescription(e.target.value)}
              />
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !newMilestoneDueDate && "text-muted-foreground"
                      )}
                    >
                      {newMilestoneDueDate ? format(newMilestoneDueDate, "PPP") : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newMilestoneDueDate}
                      onSelect={setNewMilestoneDueDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleCreateMilestone}>Create Milestone</Button>
            </CardFooter>
          )}
        </Card>

        {/* Tasks */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage project tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {projectTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks yet.</p>
              ) : (
                <div className="space-y-4">
                  {projectTasks.map(task => (
                    <Card key={task.id}>
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle>{task.title}</CardTitle>
                        <div>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{task.description}</p>
                        <p className="text-sm">Due Date: {new Date(task.due_date || '').toLocaleDateString()}</p>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateTaskStatus(task.id, 'not_started' as TaskStatus)}>
                            Not Started
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateTaskStatus(task.id, 'in_progress' as TaskStatus)}>
                            In Progress
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateTaskStatus(task.id, 'completed' as TaskStatus)}>
                            Completed
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateTaskStatus(task.id, 'blocked' as TaskStatus)}>
                            Blocked
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {isProjectOwner && (
            <CardFooter className="flex flex-col space-y-4">
              <CardTitle>Create New Task</CardTitle>
              <Input
                type="text"
                placeholder="Task Title"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              <Textarea
                placeholder="Task Description"
                value={newTaskDescription}
                onChange={e => setNewTaskDescription(e.target.value)}
              />
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !newTaskDueDate && "text-muted-foreground"
                      )}
                    >
                      {newTaskDueDate ? format(newTaskDueDate, "PPP") : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                type="text"
                placeholder="Milestone ID"
                value={selectedMilestone || ''}
                onChange={e => setSelectedMilestone(e.target.value)}
              />
              <Button onClick={handleCreateTask}>Create Task</Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Reviews</CardTitle>
            <CardDescription>Feedback and reviews for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {projectReviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {projectReviews.map(review => (
                    <Card key={review.id}>
                      <CardHeader>
                        <CardTitle>Rating: {review.rating}/5</CardTitle>
                        <CardDescription>
                          Reviewed by {review.reviewer_id} on {new Date(review.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectPage;
