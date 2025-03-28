
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useProjects, Project, ProjectApplication, ProjectMilestone } from "@/context/ProjectContext";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, Calendar, User, Users, Clock, CheckCircle, ArrowRight, Trash, Plus, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    projects, 
    teams, 
    messages,
    applyToProject, 
    updateProjectStatus, 
    selectTeam, 
    createMilestone,
    updateMilestone,
    sendMessage
  } = useProjects();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Application form
  const [applyAsTeam, setApplyAsTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<{id: string; name: string; email: string; role: string}[]>([
    { id: user?.id || "", name: user?.name || "", email: user?.email || "", role: "" }
  ]);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  
  // Milestone form
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  
  // Messages
  const [messageContent, setMessageContent] = useState("");
  const [projectMessages, setProjectMessages] = useState<typeof messages[string]>([]);
  
  // Load project data
  useEffect(() => {
    if (id) {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject || null);
      setLoading(false);
      
      // Load messages for this project
      if (foundProject && messages[foundProject.id]) {
        setProjectMessages(messages[foundProject.id]);
      }
    }
  }, [id, projects, messages]);
  
  // Calculate project progress
  const calculateProgress = () => {
    if (!project || project.milestones.length === 0) return 0;
    
    const completedTasks = project.milestones.reduce(
      (acc, milestone) => acc + milestone.tasks.filter(task => task.completed).length, 
      0
    );
    
    const totalTasks = project.milestones.reduce(
      (acc, milestone) => acc + milestone.tasks.length, 
      0
    );
    
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };
  
  const hasApplied = () => {
    if (!project || !user) return false;
    
    return project.applications.some(app => 
      app.members.some(m => m.id === user.id) || app.teamLead === user.id
    );
  };
  
  const isCreator = () => {
    return project?.createdBy.id === user?.id;
  };
  
  const isTeamMember = () => {
    if (!project || !user || !project.selectedTeam) return false;
    
    const team = teams.find(t => t.id === project.selectedTeam);
    return team ? team.members.some(m => m.id === user.id) : false;
  };
  
  const getTeamInfo = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { id: "", name: "", email: "", role: "" }
    ]);
  };
  
  const updateTeamMember = (index: number, field: keyof typeof teamMembers[0], value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };
  
  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      const updated = [...teamMembers];
      updated.splice(index, 1);
      setTeamMembers(updated);
    }
  };
  
  const handleApply = async () => {
    if (!project || !user) return;
    
    // Validate form
    if (!coverLetter.trim()) {
      toast.error("Please provide a cover letter");
      return;
    }
    
    if (applyAsTeam) {
      if (!teamName.trim()) {
        toast.error("Please provide a team name");
        return;
      }
      
      // Validate team members
      for (const member of teamMembers) {
        if (!member.name.trim() || !member.email.trim()) {
          toast.error("Please fill in all team member details");
          return;
        }
      }
    }
    
    setIsApplying(true);
    
    try {
      await applyToProject(project.id, {
        teamId: applyAsTeam ? undefined : undefined,
        teamName: applyAsTeam ? teamName : undefined,
        teamLead: applyAsTeam ? user.id : undefined,
        members: applyAsTeam ? teamMembers : [{ id: user.id, name: user.name, email: user.email, role: "Applicant" }],
        coverLetter,
      });
      
      toast.success("Application submitted successfully");
      setActiveTab("overview");
      // Refresh project data
      const updatedProject = projects.find(p => p.id === id);
      setProject(updatedProject || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleStatusUpdate = async (status: Project["status"]) => {
    if (!project) return;
    
    try {
      await updateProjectStatus(project.id, status);
      toast.success(`Project status updated to ${status}`);
      
      // Refresh project data
      const updatedProject = projects.find(p => p.id === id);
      setProject(updatedProject || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update project status");
    }
  };
  
  const handleSelectTeam = async (teamId: string) => {
    if (!project) return;
    
    try {
      await selectTeam(project.id, teamId);
      toast.success("Team selected successfully");
      
      // Refresh project data
      const updatedProject = projects.find(p => p.id === id);
      setProject(updatedProject || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to select team");
    }
  };
  
  const handleAddMilestone = async () => {
    if (!project) return;
    
    // Validate form
    if (!newMilestoneTitle.trim()) {
      toast.error("Please provide a milestone title");
      return;
    }
    
    if (!newMilestoneDescription.trim()) {
      toast.error("Please provide a milestone description");
      return;
    }
    
    if (!newMilestoneDueDate) {
      toast.error("Please select a due date");
      return;
    }
    
    setIsAddingMilestone(true);
    
    try {
      await createMilestone(project.id, {
        title: newMilestoneTitle,
        description: newMilestoneDescription,
        dueDate: new Date(newMilestoneDueDate),
        status: "pending",
        tasks: [],
      });
      
      toast.success("Milestone added successfully");
      
      // Reset form
      setNewMilestoneTitle("");
      setNewMilestoneDescription("");
      setNewMilestoneDueDate("");
      
      // Refresh project data
      const updatedProject = projects.find(p => p.id === id);
      setProject(updatedProject || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to add milestone");
    } finally {
      setIsAddingMilestone(false);
    }
  };
  
  const handleUpdateTask = async (milestoneId: string, taskId: string, completed: boolean) => {
    if (!project) return;
    
    try {
      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone) return;
      
      const updatedTasks = milestone.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed };
        }
        return task;
      });
      
      await updateMilestone(project.id, milestoneId, {
        tasks: updatedTasks
      });
      
      // Refresh project data
      const updatedProject = projects.find(p => p.id === id);
      setProject(updatedProject || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
    }
  };
  
  const handleSendMessage = async () => {
    if (!project || !messageContent.trim()) return;
    
    try {
      await sendMessage(project.id, messageContent);
      setMessageContent("");
      
      // Refresh messages
      if (messages[project.id]) {
        setProjectMessages(messages[project.id]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Loading project details...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/projects")}>
            Browse Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout activeTab="projects">
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <Badge className={
                project.status === "open" ? "bg-green-500" :
                project.status === "in-progress" ? "bg-blue-500" :
                project.status === "completed" ? "bg-gray-500" :
                "bg-red-500"
              }>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Posted by {project.createdBy.companyName || project.createdBy.name} • {project.category}
            </p>
          </div>
          
          <div className="flex gap-2">
            {isCreator() && project.status === "open" && (
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("cancelled")}
              >
                Cancel Project
              </Button>
            )}
            
            {isCreator() && project.status === "in-progress" && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("completed")}
              >
                Mark as Completed
              </Button>
            )}
            
            {user?.role === "student" && project.status === "open" && !hasApplied() && (
              <Button 
                onClick={() => setActiveTab("apply")}
              >
                Apply to Project
              </Button>
            )}
            
            {hasApplied() && project.status === "open" && (
              <Button 
                variant="outline" 
                disabled
              >
                Application Submitted
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Bar (for in-progress projects) */}
        {project.status === "in-progress" && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Project Progress</span>
              <span className="text-sm font-medium">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(isCreator() || isTeamMember() || project.status === "completed") && (
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            )}
            {isCreator() && project.status === "open" && (
              <TabsTrigger value="applications">
                Applications ({project.applications.length})
              </TabsTrigger>
            )}
            {user?.role === "student" && project.status === "open" && !hasApplied() && (
              <TabsTrigger value="apply">Apply</TabsTrigger>
            )}
            {(isCreator() || isTeamMember()) && (
              <TabsTrigger value="communication">Communication</TabsTrigger>
            )}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Deliverables</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {project.deliverables.map((deliverable, i) => (
                        <li key={i}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Timeline</h3>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(project.timeline.startDate).toLocaleDateString()} to{" "}
                        {new Date(project.timeline.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Team Size</h3>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{project.teamSize} members</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Payment</h3>
                    <div className="flex items-center text-muted-foreground">
                      <span>{project.paymentModel}</span>
                      {project.paymentModel === "Stipend" && project.stipendAmount && (
                        <span className="ml-1">• ₹{project.stipendAmount}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {project.selectedTeam && (
                  <div>
                    <h3 className="font-medium mb-2">Selected Team</h3>
                    <Card className="bg-muted/40">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getTeamInfo(project.selectedTeam)?.name.substring(0, 2).toUpperCase() || "TM"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h4 className="font-medium">{getTeamInfo(project.selectedTeam)?.name || "Team"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getTeamInfo(project.selectedTeam)?.members.length || 0} members
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            {/* Add Milestone Form (for creators only) */}
            {isCreator() && project.status === "in-progress" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Milestone</CardTitle>
                  <CardDescription>
                    Create milestones to track project progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="milestone-title">Milestone Title</Label>
                    <Input
                      id="milestone-title"
                      placeholder="e.g., Initial Research"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="milestone-description">Description</Label>
                    <Textarea
                      id="milestone-description"
                      placeholder="Describe what needs to be accomplished..."
                      value={newMilestoneDescription}
                      onChange={(e) => setNewMilestoneDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="milestone-due-date">Due Date</Label>
                    <Input
                      id="milestone-due-date"
                      type="date"
                      value={newMilestoneDueDate}
                      onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleAddMilestone}
                    disabled={isAddingMilestone}
                  >
                    {isAddingMilestone ? "Adding..." : "Add Milestone"}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Milestones List */}
            {project.milestones.length > 0 ? (
              <div className="space-y-4">
                {project.milestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{milestone.title}</CardTitle>
                          <CardDescription>
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={
                          milestone.status === "completed" ? "bg-green-500" :
                          milestone.status === "in-progress" ? "bg-blue-500" :
                          milestone.status === "overdue" ? "bg-red-500" :
                          "bg-amber-500"
                        }>
                          {milestone.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-muted-foreground mb-4">{milestone.description}</p>
                      
                      {/* Tasks */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Tasks</h4>
                        {milestone.tasks.length > 0 ? (
                          <ul className="space-y-2">
                            {milestone.tasks.map((task) => (
                              <li key={task.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={(e) => handleUpdateTask(milestone.id, task.id, e.target.checked)}
                                  className="mr-2 h-4 w-4 rounded border-gray-300"
                                  disabled={!isCreator() && !isTeamMember()}
                                />
                                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                  {task.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tasks added yet.</p>
                        )}
                      </div>
                    </CardContent>
                    {isCreator() && (
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          Edit Milestone
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Milestones Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    {isCreator() 
                      ? "Start tracking project progress by adding milestones." 
                      : "The project creator hasn't added any milestones yet."}
                  </p>
                  {isCreator() && project.status === "in-progress" && (
                    <Button onClick={() => setActiveTab("milestones")}>
                      Add First Milestone
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Applications Tab (for creators only) */}
          <TabsContent value="applications" className="space-y-6">
            {project.applications.length > 0 ? (
              <div className="space-y-4">
                {project.applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {application.teamName || "Individual Application"}
                          </CardTitle>
                          <CardDescription>
                            {application.members.length} member{application.members.length !== 1 ? 's' : ''}
                            {application.teamLead && " • Team Lead: " + 
                              application.members.find(m => m.id === application.teamLead)?.name}
                          </CardDescription>
                        </div>
                        <Badge className={
                          application.status === "accepted" ? "bg-green-500" :
                          application.status === "rejected" ? "bg-red-500" :
                          "bg-amber-500"
                        }>
                          {application.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-1">Cover Letter</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{application.coverLetter}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Team Members</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {application.members.map((member, i) => (
                            <div key={i} className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    {project.status === "open" && application.status === "pending" && (
                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {/* Would implement in real app */}}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleSelectTeam(application.teamId || "")}
                        >
                          Select Team
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Users className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Your project hasn't received any applications yet. Share it with potential applicants or wait for students to discover it.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Apply Tab (for students only) */}
          <TabsContent value="apply" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Apply to Project</CardTitle>
                <CardDescription>
                  Submit your application to work on this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="apply-as-team"
                    checked={applyAsTeam}
                    onChange={(e) => setApplyAsTeam(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="apply-as-team">Apply as a team</Label>
                </div>
                
                {applyAsTeam && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        placeholder="Enter your team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Team Members</Label>
                      {teamMembers.map((member, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <Input
                            className="col-span-5"
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                            disabled={index === 0} // First member is current user
                          />
                          <Input
                            className="col-span-5"
                            placeholder="Email"
                            type="email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                            disabled={index === 0} // First member is current user
                          />
                          <Input
                            className="col-span-2"
                            placeholder="Role"
                            value={member.role}
                            onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                          />
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 mt-1.5"
                              onClick={() => removeTeamMember(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTeamMember}
                        className="w-full mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="cover-letter">Cover Letter</Label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Explain why you're interested in this project and what skills you bring..."
                    className="min-h-[150px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("overview")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Communication</CardTitle>
                <CardDescription>
                  Communicate with team members and the project owner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 h-[300px] overflow-y-auto space-y-4">
                  {projectMessages && projectMessages.length > 0 ? (
                    projectMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="text-xs mb-1 opacity-70">
                            {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message here..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="resize-none"
                  />
                  <Button
                    className="self-end"
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
