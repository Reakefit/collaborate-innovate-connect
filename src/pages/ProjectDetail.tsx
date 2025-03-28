
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useProjects, Project, ProjectApplication, ProjectMilestone } from "@/context/ProjectContext";
import { MessageSquare, User, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const applicationSchema = z.object({
  coverLetter: z.string().min(100, { message: "Cover letter must be at least 100 characters" }),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

const milestoneSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  dueDate: z.date(),
});

type MilestoneValues = z.infer<typeof milestoneSchema>;

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { 
    projects, 
    messages, 
    applyToProject, 
    selectTeam, 
    updateProjectStatus, 
    createMilestone, 
    updateMilestone, 
    sendMessage 
  } = useProjects();
  
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [projectMessages, setProjectMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  
  const applicationForm = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });
  
  const milestoneForm = useForm<MilestoneValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
    },
  });
  
  useEffect(() => {
    if (id) {
      const foundProject = projects.find((p) => p.id === id);
      setProject(foundProject);
    }
  }, [id, projects]);
  
  useEffect(() => {
    if (project) {
      setProjectMessages(messages[project.id] || []);
    }
  }, [project, messages]);
  
  if (!project || !user || !profile) {
    return <div>Loading...</div>;
  }
  
  const isCreator = project.createdBy.id === user.id;
  const userApplication = project.applications.find(app => 
    app.members.some(m => m.id === user.id) || app.teamLead === user.id
  );
  
  const handleApply = async (values: ApplicationValues) => {
    try {
      setIsApplying(true);
      
      // Mock team data for individual application
      const applicationData = {
        coverLetter: values.coverLetter,
        members: [{
          id: user.id,
          name: profile.name,
          email: user.email || "",
          role: profile.role,
        }],
      };
      
      await applyToProject(project.id, applicationData);
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleSelectTeam = async (teamId: string) => {
    try {
      await selectTeam(project.id, teamId);
      toast.success("Team selected successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to select team");
    }
  };
  
  const handleUpdateStatus = async (status: Project["status"]) => {
    try {
      await updateProjectStatus(project.id, status);
      toast.success(`Project status updated to ${status}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update project status");
    }
  };
  
  const handleCreateMilestone = async (values: MilestoneValues) => {
    try {
      setIsCreatingMilestone(true);
      
      const milestoneData = {
        title: values.title,
        description: values.description || "",
        dueDate: values.dueDate,
      };
      
      await createMilestone(project.id, milestoneData);
      setShowMilestoneModal(false);
      toast.success("Milestone created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create milestone");
    } finally {
      setIsCreatingMilestone(false);
    }
  };
  
  const handleUpdateMilestone = async (milestoneId: string, update: Partial<ProjectMilestone>) => {
    try {
      await updateMilestone(project.id, milestoneId, update);
      toast.success("Milestone updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update milestone");
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage(project.id, newMessage);
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };
  
  return (
    <DashboardLayout activeTab="projects">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground">
            {project.description}
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Information about this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-muted-foreground">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Model</p>
                    <p className="text-muted-foreground">
                      {project.paymentModel}
                      {project.stipendAmount && ` - $${project.stipendAmount}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Team Size</p>
                    <p className="text-muted-foreground">{project.teamSize} members</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-muted-foreground">{project.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-muted-foreground">
                      {new Date(project.timeline.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-muted-foreground">
                      {new Date(project.timeline.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium">Deliverables</p>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    {project.deliverables.map((deliverable, index) => (
                      <li key={index}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-secondary rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
              {isCreator && project.status === "open" && (
                <Button onClick={() => navigate(`/edit-project/${project.id}`)}>
                  Edit Project
                </Button>
              )}
              
              {userApplication?.status === "pending" && (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              
              {project.status === "open" && !isCreator && !userApplication && (
                <Button onClick={() => setShowApplyModal(true)} disabled={isApplying}>
                  {isApplying ? "Applying..." : "Apply Now"}
                </Button>
              )}
            </div>
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {isCreator ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Project Applications</CardTitle>
                    <CardDescription>
                      Review applications from interested students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.applications.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No applications yet</h3>
                        <p className="text-muted-foreground mt-2">
                          Share this project to attract talented students
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {project.applications.map((application) => (
                          <Card key={application.id}>
                            <CardHeader>
                              <CardTitle>
                                {application.teamName || application.members[0].name}
                              </CardTitle>
                              <CardDescription>
                                {application.teamName ? "Team Application" : "Individual Application"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p className="text-sm font-medium">Cover Letter</p>
                              <p className="text-muted-foreground">{application.coverLetter}</p>
                              
                              <Separator className="my-4" />
                              
                              <p className="text-sm font-medium">Members</p>
                              <ul className="list-disc pl-4 text-muted-foreground">
                                {application.members.map((member) => (
                                  <li key={member.id}>{member.name} ({member.email})</li>
                                ))}
                              </ul>
                            </CardContent>
                            <CardFooter className="justify-end">
                              {project.selectedTeam ? (
                                project.selectedTeam === application.teamId ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )
                              ) : (
                                <Button onClick={() => handleSelectTeam(application.teamId || "")}>
                                  Select Team
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {project.status === "open" && project.applications.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={() => handleUpdateStatus("cancelled")}>
                      Cancel Project
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Application</CardTitle>
                  <CardDescription>
                    Track the status of your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userApplication ? (
                    <>
                      <p>Status: {userApplication.status}</p>
                      <p>Cover Letter: {userApplication.coverLetter}</p>
                    </>
                  ) : (
                    <p>You have not applied to this project yet.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Track progress and manage milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No milestones yet</h3>
                    <p className="text-muted-foreground mt-2">
                      {isCreator ? "Add milestones to break down the project" : "Waiting for milestones to be added"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {project.milestones.map((milestone) => (
                      <Card key={milestone.id}>
                        <CardHeader>
                          <CardTitle>{milestone.title}</CardTitle>
                          <CardDescription>
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-muted-foreground">{milestone.description}</p>
                          
                          <Separator className="my-4" />
                          
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-muted-foreground">{milestone.status}</p>
                        </CardContent>
                        <CardFooter className="justify-end">
                          {isCreator && (
                            <Button onClick={() => handleUpdateMilestone(milestone.id, { status: "completed" })}>
                              Mark as Complete
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {isCreator && (
              <Button onClick={() => setShowMilestoneModal(true)}>
                Add Milestone
              </Button>
            )}
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Chat</CardTitle>
                <CardDescription>
                  Communicate with the project team
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto">
                {projectMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No messages yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Start the conversation with the project team
                    </p>
                  </div>
                ) : (
                  projectMessages.map((msg) => (
                    <div key={msg.id} className="mb-2">
                      <p className="text-sm font-medium">{msg.senderName}</p>
                      <p className="text-muted-foreground">{msg.content}</p>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="w-full flex">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="mr-2"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {project.title}</DialogTitle>
            <DialogDescription>
              Submit your application to join this project
            </DialogDescription>
          </DialogHeader>
          <Form {...applicationForm}>
            <form onSubmit={applicationForm.handleSubmit(handleApply)} className="space-y-4">
              <FormField
                control={applicationForm.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Why are you a good fit for this project?" {...field} />
                    </FormControl>
                    <FormDescription>Write a compelling cover letter.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isApplying}>
                  {isApplying ? "Applying..." : "Submit Application"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Milestone Modal */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone for this project
            </DialogDescription>
          </DialogHeader>
          <Form {...milestoneForm}>
            <form onSubmit={milestoneForm.handleSubmit(handleCreateMilestone)} className="space-y-4">
              <FormField
                control={milestoneForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Milestone Title" {...field} />
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
                      <Textarea placeholder="Milestone Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isCreatingMilestone}>
                  {isCreatingMilestone ? "Creating..." : "Create Milestone"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProjectDetail;
