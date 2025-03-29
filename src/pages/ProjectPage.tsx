
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import {
  Loader2, Plus, Upload, Send, CheckCircle, AlertCircle, 
  Users, FileText, MessageSquare, Star, Calendar, Target, 
  BarChart, UserPlus, CheckCircle2, XCircle, ArrowRight,
  Clock, FileCheck
} from 'lucide-react';

// Utilities
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Project, ProjectTask, ProjectMilestone, ProjectMessage, 
  ProjectFeedback, Application, Deliverable, TaskStatus 
} from '@/types/database';

// Schemas for forms
const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  assigned_team_id: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  milestone_id: z.string().optional(),
  assigned_to: z.string().optional(),
});

const messageSchema = z.object({
  content: z.string().min(1, 'Message is required'),
});

const applicationSchema = z.object({
  cover_letter: z.string().min(1, 'Cover letter is required'),
});

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    projects, 
    applyToProject, 
    getProject,
    getProjectMilestones,
    getProjectTasks,
    getProjectMessages,
    getProjectReviews,
    getProjectNotifications,
    getProjectAnalytics,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createTask,
    updateTask,
    deleteTask,
    sendMessage,
    createReview,
    createNotification,
    markNotificationAsRead
  } = useProjects();
  const { user, profile } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [feedback, setFeedback] = useState<ProjectFeedback[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'deadline' | 'task' | 'message' | 'milestone';
    content: string;
    created_at: string;
    read: boolean;
  }>>([]);
  const [analytics, setAnalytics] = useState<{
    totalTasks: number;
    completedTasks: number;
    totalMilestones: number;
    completedMilestones: number;
    averageFeedbackRating: number;
  } | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isProjectMember, setIsProjectMember] = useState(false);
  const [loadingApplication, setLoadingApplication] = useState(false);

  // Get the current project
  const project = projects.find(p => p.id === projectId) as Project | undefined;
  const isProjectOwner = project?.created_by === user?.id;
  const isStudent = profile?.role === 'student';
  const hasApplied = project?.applications?.some(app => 
    app.team?.members?.some(m => m.user_id === user?.id)
  );

  // Forms
  const milestoneForm = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: { title: '', description: '' },
  });

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' },
  });

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const applicationForm = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { cover_letter: '' },
  });

  // Check if user is a project member
  useEffect(() => {
    if (projectId && user?.id) {
      checkProjectMembership();
    }
  }, [projectId, user?.id]);

  // Fetch project data on load
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const checkProjectMembership = async () => {
    try {
      // Check if user is part of a team that has been accepted for this project
      const { data, error } = await fetch(`/api/projects/${projectId}/membership/${user?.id}`)
        .then(res => res.json());
        
      setIsProjectMember(!!data?.is_member);
    } catch (error) {
      console.error('Error checking project membership:', error);
      setIsProjectMember(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const promises = [
        fetchMilestones(),
        fetchDeliverables()
      ];

      if (isProjectMember || isProjectOwner) {
        promises.push(
          fetchTasks(),
          fetchMessages(),
          fetchFeedback(),
          fetchNotifications(),
          fetchAnalytics()
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectMilestones(projectId);
      setMilestones(data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMessages = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectMessages(projectId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFeedback = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectReviews(projectId);
      
      // Add updated_at field if missing
      const feedbackWithUpdated = data.map(item => ({
        ...item,
        updated_at: item.updated_at || item.created_at
      }));
      
      setFeedback(feedbackWithUpdated as ProjectFeedback[]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectAnalytics(projectId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!projectId || !user?.id) return;
    try {
      const data = await getProjectNotifications(projectId, user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchDeliverables = async () => {
    if (!projectId) return;
    try {
      const { data, error } = await fetch(`/api/projects/${projectId}/deliverables`)
        .then(res => res.json());

      if (error) throw error;

      const deliverablesData = (data || []).map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description || '',
        status: (milestone.status === 'completed' ? 'completed' : 
                milestone.status === 'in_progress' ? 'in_progress' : 
                'not_started') as Deliverable['status'],
        due_date: milestone.due_date,
        milestone_id: milestone.id
      }));

      setDeliverables(deliverablesData);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
    }
  };

  const handleCreateMilestone = async (values: z.infer<typeof milestoneSchema>) => {
    if (!projectId) return;

    try {
      await createMilestone({
        project_id: projectId,
        title: values.title,
        description: values.description || '',
        due_date: values.due_date || null,
        assigned_team_id: values.assigned_team_id || null,
        status: 'not_started'
      });
      setShowMilestoneModal(false);
      milestoneForm.reset();
      fetchMilestones();
      toast.success('Milestone created successfully');
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  const handleCreateTask = async (values: z.infer<typeof taskSchema>) => {
    if (!projectId) return;

    try {
      await createTask({
        project_id: projectId,
        title: values.title,
        description: values.description || '',
        due_date: values.due_date || null,
        milestone_id: values.milestone_id || null,
        assigned_to: values.assigned_to || null,
        status: 'not_started',
        created_by: user?.id || ''
      });
      setShowTaskModal(false);
      taskForm.reset();
      fetchTasks();
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleSendMessage = async (values: z.infer<typeof messageSchema>) => {
    if (!projectId || !user?.id) return;

    try {
      await sendMessage({
        project_id: projectId,
        sender_id: user.id,
        content: values.content
      });
      messageForm.reset();
      fetchMessages();
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask(taskId, { status });
      fetchTasks();
      toast.success(`Task status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleApplyToProject = async (values: { cover_letter: string }) => {
    if (!projectId || !user?.id) return;

    try {
      setLoadingApplication(true);
      await applyToProject(projectId, user.id, values.cover_letter);
      setShowApplicationModal(false);
      applicationForm.reset();
      toast.success('Application submitted successfully');
      // Reload page to show updated application status
      window.location.reload();
    } catch (error) {
      console.error('Error applying to project:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data, error } = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(res => res.json());

      if (error) throw error;
      
      toast.success(`Application ${status} successfully`);
      // Reload projects to show updated application status
      window.location.reload();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-1/3 mb-2" />
          <Skeleton className="h-6 w-2/3 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 min-h-[500px] flex flex-col items-center justify-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/projects')}>
          Browse Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">{project.category}</Badge>
              {project.payment_model && (
                <Badge variant="outline">{project.payment_model}</Badge>
              )}
              <Badge variant={
                new Date(project.end_date) > new Date() ? "default" : "destructive"
              }>
                {new Date(project.end_date) > new Date() ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
          
          {isStudent && !hasApplied && new Date(project.end_date) > new Date() && (
            <Button onClick={() => setShowApplicationModal(true)} className="flex-shrink-0">
              <UserPlus className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
          )}
          
          {isProjectOwner && (
            <Button variant="outline" onClick={() => navigate(`/projects/${projectId}/edit`)} className="flex-shrink-0">
              Edit Project
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="font-medium">{project.team_size} members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="deliverables" className="py-2">Deliverables</TabsTrigger>
          <TabsTrigger value="timeline" className="py-2">Timeline</TabsTrigger>
          {isProjectOwner && (
            <>
              <TabsTrigger value="applicants" className="py-2">Applicants</TabsTrigger>
              <TabsTrigger value="resources" className="py-2">Resources</TabsTrigger>
              <TabsTrigger value="analytics" className="py-2">Analytics</TabsTrigger>
            </>
          )}
          {isProjectMember && (
            <>
              <TabsTrigger value="tasks" className="py-2">My Tasks</TabsTrigger>
              <TabsTrigger value="messages" className="py-2">Messages</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Objectives</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              {project.payment_model && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment Model</h3>
                  <div className="flex items-center gap-2">
                    <Badge>{project.payment_model}</Badge>
                    {project.stipend_amount > 0 && (
                      <span className="text-sm">Amount: ${project.stipend_amount}</span>
                    )}
                  </div>
                </div>
              )}
              
              {isProjectOwner && project.applications && project.applications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Applications</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{project.applications.length}</span>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('applicants')}>
                      View All Applications
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Status */}
          {isStudent && hasApplied && (
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant={
                    project.applications?.find(app => app.team?.members?.some(m => m.user_id === user?.id))?.status === 'accepted' ? 'success' :
                    project.applications?.find(app => app.team?.members?.some(m => m.user_id === user?.id))?.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    {project.applications?.find(app => app.team?.members?.some(m => m.user_id === user?.id))?.status || 'Pending'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Applied on {new Date(project.applications?.find(app => app.team?.members?.some(m => m.user_id === user?.id))?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                
                {project.applications?.find(app => app.team?.members?.some(m => m.user_id === user?.id))?.status === 'accepted' && (
                  <div className="mt-4">
                    <Button variant="default" onClick={() => setActiveTab('tasks')}>
                      View My Tasks
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {[...tasks, ...messages, ...feedback]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((item) => (
                      <div key={item.id} className="flex items-start gap-4 pb-4 border-b">
                        <Avatar>
                          <AvatarImage src={undefined} />
                          <AvatarFallback>
                            {('title' in item) ? 'T' : ('content' in item) ? 'M' : 'F'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {'title' in item ? item.title : 'content' in item ? item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '') : 'Feedback provided'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                  {[...tasks, ...messages, ...feedback].length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Deliverables</CardTitle>
              {isProjectOwner && (
                <Button size="sm" onClick={() => setShowMilestoneModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deliverable
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {deliverables.length > 0 ? (
                <div className="space-y-4">
                  {deliverables.map((deliverable, index) => (
                    <Card key={deliverable.id} className="overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium">
                            {index + 1}
                          </div>
                          <h3 className="font-medium">{deliverable.title}</h3>
                        </div>
                        <Badge variant={
                          deliverable.status === 'completed' ? 'default' : 
                          deliverable.status === 'in_progress' ? 'secondary' : 
                          'outline'
                        }>
                          {deliverable.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                        {deliverable.due_date && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(deliverable.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {isProjectOwner && (
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedMilestone(milestones.find(m => m.id === deliverable.milestone_id) || null);
                              setShowMilestoneModal(true);
                            }}>
                              Edit
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Deliverables Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    {isProjectOwner 
                      ? "Start by adding deliverables to outline what needs to be accomplished in this project."
                      : "The project owner hasn't added any deliverables yet."}
                  </p>
                  {isProjectOwner && (
                    <Button onClick={() => setShowMilestoneModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Deliverable
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Timeline</CardTitle>
              {isProjectOwner && (
                <Button size="sm" onClick={() => setShowMilestoneModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {milestones.length > 0 ? (
                <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-4 before:w-[1px] before:bg-border">
                  {milestones
                    .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
                    .map((milestone) => (
                      <div key={milestone.id} className="relative">
                        <div className="absolute left-[-30px] flex items-center justify-center w-6 h-6 rounded-full bg-background border border-primary">
                          <div className={`w-3 h-3 rounded-full ${
                            milestone.status === 'completed' ? 'bg-primary' : 'bg-muted'
                          }`} />
                        </div>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-medium">{milestone.title}</CardTitle>
                              <Badge variant={
                                milestone.status === 'completed' ? 'default' : 
                                milestone.status === 'in_progress' ? 'secondary' : 
                                new Date(milestone.due_date || '').getTime() < Date.now() ? 'destructive' :
                                'outline'
                              }>
                                {milestone.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {milestone.due_date && (
                              <CardDescription>
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            
                            {isProjectOwner && (
                              <div className="flex justify-end mt-4">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedMilestone(milestone);
                                  setShowMilestoneModal(true);
                                }}>
                                  Edit
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Milestones Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    {isProjectOwner 
                      ? "Start by adding milestones to outline the key progress points for this project."
                      : "The project owner hasn't added any milestones yet."}
                  </p>
                  {isProjectOwner && (
                    <Button onClick={() => setShowMilestoneModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Milestone
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applicants Tab (Startup View) */}
        {isProjectOwner && (
          <TabsContent value="applicants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Applications</CardTitle>
                <CardDescription>
                  Review and manage applications for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.applications && project.applications.length > 0 ? (
                  <div className="space-y-6">
                    {project.applications.map((application) => (
                      <Card key={application.id} className="overflow-hidden">
                        <div className="bg-muted/20 p-4 border-b">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-lg">{application.team?.name || 'Individual Application'}</h3>
                              <p className="text-sm text-muted-foreground">
                                Applied on {new Date(application.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              application.status === 'accepted' ? 'default' :
                              application.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {application.status}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          {application.team?.members && application.team.members.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Team Members</h4>
                              <div className="flex flex-wrap gap-2">
                                {application.team.members.map((member) => (
                                  <div key={member.id} className="flex items-center gap-2 border rounded-lg p-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback>{member.user?.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{member.user?.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Cover Letter</h4>
                            <div className="bg-muted/20 p-3 rounded-md text-sm">
                              {application.cover_letter}
                            </div>
                          </div>
                          
                          {application.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Your project hasn't received any applications yet. Share the project with potential candidates or check back later.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Resources Tab (Startup View) */}
        {isProjectOwner && (
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Resources</CardTitle>
                  <CardDescription>
                    Share documents, links, and resources with the project team
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowResourceModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </CardHeader>
              <CardContent>
                {project.resources && project.resources.length > 0 ? (
                  <div className="space-y-4">
                    {project.resources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                Access
                              </a>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Resources Added</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      Add resources like documents, links, or tools to share with your project team.
                    </p>
                    <Button onClick={() => setShowResourceModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Resource
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Analytics Tab (Startup View) */}
        {isProjectOwner && (
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
                <CardDescription>
                  Track the progress and performance of your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        {analytics?.completedTasks || 0}/{analytics?.totalTasks || 0}
                      </div>
                      <Progress 
                        value={analytics?.totalTasks 
                          ? (analytics.completedTasks / analytics.totalTasks) * 100 
                          : 0
                        } 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Milestone Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        {analytics?.completedMilestones || 0}/{analytics?.totalMilestones || 0}
                      </div>
                      <Progress 
                        value={analytics?.totalMilestones 
                          ? (analytics.completedMilestones / analytics.totalMilestones) * 100 
                          : 0
                        } 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold">
                          {project.applications?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Applications
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="flex items-center">
                          <div className="text-2xl font-bold">
                            {analytics?.averageFeedbackRating?.toFixed(1) || 0}
                          </div>
                          <Star className="h-5 w-5 text-yellow-500 ml-1" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {feedback.length} reviews
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold">
                          {Math.max(0, Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Days Left
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tasks Tab (Member View) */}
        {isProjectMember && (
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>
                    Manage your project tasks and track your progress
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowTaskModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['not_started', 'in_progress', 'completed', 'blocked'].map((status) => (
                    <Card key={status} className="overflow-hidden">
                      <div className={`p-3 border-b ${
                        status === 'completed' ? 'bg-green-50 text-green-700' :
                        status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                        status === 'blocked' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        <h3 className="font-medium capitalize">
                          {status.replace('_', ' ')}
                        </h3>
                      </div>
                      <div className="p-2">
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2 p-2">
                            {tasks
                              .filter((task) => task.status === status && task.assigned_to === user?.id)
                              .map((task) => (
                                <Card key={task.id} className="overflow-hidden">
                                  <div className="p-3">
                                    <h4 className="font-medium mb-1">{task.title}</h4>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                    )}
                                    {task.due_date && (
                                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {['not_started', 'in_progress', 'completed', 'blocked'].map((newStatus) => (
                                        <Button
                                          key={newStatus}
                                          variant={task.status === newStatus ? "default" : "outline"}
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => handleUpdateTaskStatus(task.id, newStatus as TaskStatus)}
                                        >
                                          {newStatus.replace('_', ' ')}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                              
                            {tasks.filter((task) => task.status === status && task.assigned_to === user?.id).length === 0 && (
                              <div className="text-center py-6">
                                <p className="text-xs text-muted-foreground">No tasks</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Messages Tab (Member View) */}
        {isProjectMember && (
          <TabsContent value="messages" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Project Chat</CardTitle>
                <CardDescription>
                  Communicate with the project team and startup
                </CardDescription>
              </CardHeader>
              <div className="border-t">
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-4">
                    {messages.length > 0 ? messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[70%] ${message.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback>
                              {message.sender?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg p-3 ${
                            message.sender_id === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Start the conversation to collaborate with your team and project owner.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="flex gap-2">
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Type a message..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Milestone Modal */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMilestone ? 'Edit Milestone' : 'Add New Milestone'}
            </DialogTitle>
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
                      <Textarea placeholder="Milestone description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={milestoneForm.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {selectedMilestone ? 'Update Milestone' : 'Create Milestone'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Project</DialogTitle>
          </DialogHeader>
          <Form {...applicationForm}>
            <form onSubmit={applicationForm.handleSubmit(handleApplyToProject)} className="space-y-4">
              <FormField
                control={applicationForm.control}
                name="cover_letter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why you're interested in this project and what skills you can bring..." 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={loadingApplication}>
                  {loadingApplication ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
