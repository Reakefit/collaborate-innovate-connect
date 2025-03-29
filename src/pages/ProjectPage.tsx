import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useProject } from "@/context/ProjectContext";
import { Project, Application, ProjectMilestone, ProjectTask, MilestoneStatus, TaskStatus } from "@/types/database";
import { MessageSquare, User, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Send, ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Update the CreateTaskForm component
const CreateTaskForm = ({ milestoneId, projectId, onSuccess }: { 
  milestoneId: string; 
  projectId: string; 
  onSuccess: () => void; 
}) => {
  const { user } = useAuth();
  const { addTask } = useProject();
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState("");
  
  const form = useForm<{
    title: string;
    description: string;
  }>({
    resolver: zodResolver(z.object({
      title: z.string().min(3, "Title must be at least 3 characters"),
      description: z.string().optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof form.formState.resolver["schema"]>) => {
    try {
      if (!user) return;
      
      await addTask(projectId, milestoneId, {
        title: values.title,
        description: values.description,
        status: "todo" as TaskStatus,
        assigned_to: assignedTo,
        created_by: user.id,
        completed: false,
        due_date: dueDate ? dueDate.toISOString() : undefined
      });
      
      form.reset();
      setDueDate(undefined);
      setAssignedTo("");
      onSuccess();
      toast.success("Task created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error creating task");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Due Date (Optional)</FormLabel>
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </div>
        <div className="space-y-2">
          <FormLabel>Assigned To (Optional)</FormLabel>
          <Input
            placeholder="Enter user ID or email"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>
        <Button type="submit">Create Task</Button>
      </form>
    </Form>
  );
};

// Fix the Calendar renderer
const CustomCalendar = ({ selected, onSelect, disabled }: {
  selected: Date;
  onSelect: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}) => {
  return (
    <CalendarComponent
      mode="single"
      selected={selected}
      onSelect={(date) => date && onSelect(date)}
      disabled={disabled}
      initialFocus
    />
  );
};

// Update the ProjectPage component
const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { projects, loading, fetchProject, updateTaskStatus } = useProject();
  const navigate = useNavigate();
  const [showCreateMilestoneModal, setShowCreateMilestoneModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneDate, setMilestoneDate] = useState<Date>(new Date());
  
  useEffect(() => {
    if (id) {
      const loadProject = async () => {
        try {
          const projectData = await fetchProject(id);
          if (projectData) {
            setProject(projectData);
          } else {
            toast.error("Project not found");
            navigate("/projects");
          }
        } catch (error: any) {
          toast.error(error.message || "Error loading project");
        }
      };
      
      loadProject();
    }
  }, [id, fetchProject, navigate]);
  
  if (loading || !project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  const handleCreateMilestone = async () => {
    try {
      if (!id) return;
      
      await addMilestone(id, {
        title: milestoneTitle,
        description: milestoneDescription,
        due_date: milestoneDate.toISOString(),
        status: "not_started" as MilestoneStatus
      });
      
      setMilestoneTitle("");
      setMilestoneDescription("");
      setMilestoneDate(new Date());
      setShowCreateMilestoneModal(false);
      toast.success("Milestone created successfully!");
      
      // Refresh project data
      const updatedProject = await fetchProject(id);
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating milestone");
    }
  };
  
  // Fix the handleDateSelect function to work with Date objects
  const handleDateSelect = (date: Date) => {
    setMilestoneDate(date);
  };
  
  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      
      // Refresh project data
      if (id) {
        const updatedProject = await fetchProject(id);
        if (updatedProject) {
          setProject(updatedProject);
        }
      }
      
      toast.success("Task status updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating task status");
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold">{project.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Start Date:</span>
                <span className="text-sm">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">End Date:</span>
                <span className="text-sm">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Model:</span>
                <span className="text-sm">{project.payment_model}</span>
              </div>
              {project.payment_model === "hourly" && project.hourly_rate && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Rate:</span>
                  <span className="text-sm">${project.hourly_rate}/hour</span>
                </div>
              )}
              {project.payment_model === "fixed" && project.fixed_amount && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm">${project.fixed_amount}</span>
                </div>
              )}
              {project.payment_model === "equity" && project.equity_percentage && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Equity:</span>
                  <span className="text-sm">{project.equity_percentage}%</span>
                </div>
              )}
              {project.payment_model === "stipend" && project.stipend_amount && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Stipend:</span>
                  <span className="text-sm">${project.stipend_amount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.selected_team ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Selected Team:</span>
                  <span className="text-sm">{project.selected_team}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Team
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No team has been selected for this project yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Project Milestones</h2>
          {(user?.id === project.created_by || profile?.role === "startup") && (
            <Button onClick={() => setShowCreateMilestoneModal(true)}>
              Add Milestone
            </Button>
          )}
        </div>
        
        {project.milestones && project.milestones.length > 0 ? (
          <div className="space-y-4">
            {project.milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{milestone.title}</CardTitle>
                    <Badge
                      variant={
                        milestone.status === "completed"
                          ? "default"
                          : milestone.status === "in_progress"
                          ? "secondary"
                          : milestone.status === "delayed"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {milestone.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>
                    {milestone.due_date && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {new Date(milestone.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {milestone.description && <p className="mb-4">{milestone.description}</p>}
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Tasks</h3>
                      {(user?.id === project.created_by || profile?.role === "startup") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setShowCreateTaskModal(true);
                          }}
                        >
                          Add Task
                        </Button>
                      )}
                    </div>
                    
                    {milestone.tasks && milestone.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {milestone.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-md"
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-4 h-4 rounded-full mr-3 ${
                                  task.status === "completed"
                                    ? "bg-green-500"
                                    : task.status === "in_progress"
                                    ? "bg-blue-500"
                                    : task.status === "review"
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                                }`}
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
                            
                            <Select
                              value={task.status}
                              onValueChange={(value) =>
                                handleUpdateTaskStatus(task.id, value as TaskStatus)
                              }
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No tasks have been created for this milestone yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Milestones Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Create milestones to track progress and organize tasks for this project.
              </p>
              {(user?.id === project.created_by || profile?.role === "startup") && (
                <Button
                  onClick={() => setShowCreateMilestoneModal(true)}
                  className="mt-4"
                >
                  Add First Milestone
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Create Milestone Modal */}
      <Dialog open={showCreateMilestoneModal} onOpenChange={setShowCreateMilestoneModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Milestone</DialogTitle>
            <DialogDescription>
              Add a milestone to track progress on your project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="Enter milestone title"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                placeholder="Enter milestone description"
                value={milestoneDescription}
                onChange={(e) => setMilestoneDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Due Date</FormLabel>
              <CustomCalendar
                selected={milestoneDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateMilestoneModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMilestone}>Create Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Task Modal */}
      <Dialog open={showCreateTaskModal} onOpenChange={setShowCreateTaskModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a task to the milestone: {selectedMilestone?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedMilestone && id && (
            <CreateTaskForm
              milestoneId={selectedMilestone.id}
              projectId={id}
              onSuccess={() => {
                setShowCreateTaskModal(false);
                // Refresh project data
                fetchProject(id).then((updatedProject) => {
                  if (updatedProject) {
                    setProject(updatedProject);
                  }
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
