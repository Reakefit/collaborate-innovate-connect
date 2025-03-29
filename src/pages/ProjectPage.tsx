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
import { Project, Application, ProjectMilestone, ProjectTask, TaskStatus } from "@/types/database";
import { MessageSquare, User, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Send, ArrowLeft, FileText, ExternalLink, ListChecks } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const taskSchema = z.object({
  milestone_id: z.string().min(1, { message: "Please select a milestone" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  due_date: z.date(),
  assigned_to: z.string().optional(),
});

type TaskValues = z.infer<typeof taskSchema>;

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { projects, teams, applications, fetchProject, createMilestone, createTask, updateTaskStatus } = useProject();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewMilestoneModal, setShowNewMilestoneModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const taskForm = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      milestone_id: "",
      title: "",
      description: "",
      due_date: new Date(),
      assigned_to: user?.id,
    },
  });

  const milestoneForm = useForm<ProjectMilestone>({
    defaultValues: {
      project_id: id || "",
      title: "",
      description: "",
      due_date: new Date().toISOString(),
      status: "not_started",
    },
  });

  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        try {
          const fetchedProject = await fetchProject(id);
          setProject(fetchedProject);
          setIsLoading(false);
        } catch (err: any) {
          setError(err.message || "Failed to load project");
          setIsLoading(false);
        }
      }
    };

    loadProject();
  }, [id, fetchProject, refreshKey]);

  const refreshProjectData = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Project Not Found</h2>
            <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
          </div>
        </div>
      </div>
    );
  }

  // Create new task form submit handler
  const handleTaskSubmit = async (data: z.infer<typeof taskSchema>) => {
    try {
      const taskData = {
        project_id: project!.id,
        milestone_id: data.milestone_id,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        status: "not_started" as TaskStatus,
        assigned_to: data.assigned_to,
        created_by: user!.id
      };

      await createTask(taskData);
      toast.success("Task created successfully");
      setShowNewTaskModal(false);
      taskForm.reset();
      refreshProjectData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    }
  };

  // Create new milestone form submit handler
  const handleMilestoneSubmit = async (values: ProjectMilestone) => {
    try {
      await createMilestone({
        ...values,
        project_id: project.id,
      });
      toast.success("Milestone created successfully");
      setShowNewMilestoneModal(false);
      milestoneForm.reset();
      refreshProjectData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create milestone");
    }
  };

  // Update task status handler
  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success(`Task status updated to ${status}`);
      refreshProjectData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update task status");
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground">
                {project.description}
              </p>
            </div>
            <div className="space-x-2">
              {project.resources && project.resources.length > 0 && (
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Resources
                </Button>
              )}
              {user && profile?.role === "startup" && (
                <Button onClick={() => setShowNewMilestoneModal(true)}>
                  Add Milestone
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              {user && profile?.role === "startup" && (
                <TabsTrigger value="applications">Applications</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Category</h3>
                        <p className="text-muted-foreground">{project.category}</p>
                      </div>
                      {project.deliverables && project.deliverables.length > 0 && (
                        <div>
                          <h3 className="font-medium">Deliverables</h3>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {project.deliverables.map((deliverable, index) => (
                              <li key={index}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {project.start_date && project.end_date && (
                        <div>
                          <h3 className="font-medium">Timeline</h3>
                          <p className="text-muted-foreground">
                            {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                          </p>
                      </div>
                      )}
                      {project.payment_model && (
                        <div>
                          <h3 className="font-medium">Payment Model</h3>
                          <p className="text-muted-foreground">
                            {project.payment_model}
                            {project.payment_model === "Stipend" && project.stipend_amount && ` (${project.stipend_amount})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Team</h2>
                    <Card className="border-none shadow-lg">
                      <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Project collaborators</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {applications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{application.team?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {application.team?.members?.length} members
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tasks">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Tasks</h2>
                  <Button onClick={() => setShowNewTaskModal(true)}>
                    Add Task
                  </Button>
                </div>
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((milestone) => (
                    <Card key={milestone.id} className="border-none shadow-lg">
                      <CardHeader>
                        <CardTitle>{milestone.title}</CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {milestone.tasks && milestone.tasks.length > 0 ? (
                          <div className="space-y-2">
                            {milestone.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h3 className="font-medium">{task.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Due Date: {new Date(task.due_date!).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Assigned to: {task.assigned_to}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {task.status === 'completed' ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                      Completed
                                    </Badge>
                                  ) : task.status === 'blocked' ? (
                                    <Badge variant="destructive">Blocked</Badge>
                                  ) : task.status === 'in_progress' ? (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                      In Progress
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                      Not Started
                                    </Badge>
                                  )}
                                  <Select
                                    value={task.status}
                                    onValueChange={(value) => handleTaskStatusChange(task.id, value as TaskStatus)}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_started">Not Started</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No tasks for this milestone</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No milestones yet</p>
                )}
              </div>
            </TabsContent>
            {user && profile?.role === "startup" && (
              <TabsContent value="applications">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Applications</h2>
                  {applications && applications.length > 0 ? (
                    applications.map((application) => (
                      <Card key={application.id} className="border-none shadow-lg">
                        <CardHeader>
                          <CardTitle>{application.team?.name}</CardTitle>
                          <CardDescription>
                            {application.team?.members?.length} members
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2">Team Members</h3>
                              <div className="space-y-2">
                                {application.team?.members?.map((member) => (
                                  <div key={member.id} className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{member.user?.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium mb-2">Cover Letter</h3>
                              <p className="text-sm text-muted-foreground">
                                {application.cover_letter}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Badge variant={application.status === 'accepted' ? 'default' : application.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {application.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                Reject
                              </Button>
                              <Button size="sm">Accept</Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No applications yet</p>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* New Task Modal */}
      <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to this project.
            </DialogDescription>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(handleTaskSubmit)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="milestone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Milestone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a milestone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {project.milestones && project.milestones.map((milestone) => (
                          <SelectItem key={milestone.id} value={milestone.id}>
                            {milestone.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Task description"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to</FormLabel>
                    <FormControl>
                      <Input placeholder="Assign to" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Milestone Modal */}
      <Dialog open={showNewMilestoneModal} onOpenChange={setShowNewMilestoneModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Milestone</DialogTitle>
            <DialogDescription>
              Add a new milestone to this project.
            </DialogDescription>
          </DialogHeader>
          <Form {...milestoneForm}>
            <form onSubmit={milestoneForm.handleSubmit(handleMilestoneSubmit)} className="space-y-4">
              <FormField
                control={milestoneForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Milestone title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Milestone description"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Create Milestone
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
