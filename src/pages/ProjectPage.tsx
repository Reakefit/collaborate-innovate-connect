import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects, ProjectMilestone, ProjectTask, ProjectMessage, ProjectNotification } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/database';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectDocument, ProjectFeedback } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, Plus, Upload, Send, CheckCircle, Clock, AlertCircle, Users, FileText, MessageSquare, Star, Calendar as CalendarIcon, Target, FileCheck, BarChart, MessageCircle, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Deliverable, TaskStatus } from '@/types/database';

// Define the Application type
interface Application {
  id: string;
  project_id: string;
  team_id: string;
  cover_letter: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  created_at: string;
  team?: {
    id: string;
    name: string;
    members: Array<{
      id: string;
      user_id: string;
      user: {
        id: string;
        name: string;
        avatar_url?: string;
      };
    }>;
  };
}

// Define the Resource type
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
}

// Define the base project type
interface BaseProject {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  payment_model: string;
  stipend_amount: number;
  required_skills: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  progress: number;
}

// Extend the base project type
interface ExtendedProject extends BaseProject {
  deliverables?: Deliverable[];
  resources?: Resource[];
  applications?: Application[];
}

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
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
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

  const project = projects.find(p => p.id === projectId) as unknown as ExtendedProject;
  const isProjectOwner = project?.created_by === user?.id;
  const isStudent = profile?.role === 'student';
  const hasApplied = project?.applications?.some(app => app.team?.members.some(m => m.user_id === user?.id));

  const milestoneForm = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const applicationForm = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cover_letter: '',
    },
  });

  useEffect(() => {
    if (projectId && user?.id) {
      const checkProjectMembership = async () => {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('status')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          setIsProjectMember(data?.status === 'accepted');
        } catch (error) {
          console.error('Error checking project membership:', error);
          setIsProjectMember(false);
        }
      };

      checkProjectMembership();
    }
  }, [projectId, user?.id]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const promises = [
        fetchMilestones(),
        fetchDocuments(),
        fetchAnalytics()
      ];

      if (isProjectMember) {
        promises.push(
          fetchTasks(),
          fetchMessages(),
          fetchFeedback(),
          fetchNotifications()
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
    const data = await getProjectMilestones(projectId);
    setMilestones(data);
  };

  const fetchTasks = async () => {
    if (!projectId) return;
    const data = await getProjectTasks(projectId);
    setTasks(data);
  };

  const fetchDocuments = async () => {
    if (!projectId) return;
    const data = await projectService.getProjectDocuments(projectId);
    setDocuments(data);
  };

  const fetchMessages = async () => {
    if (!projectId) return;
    const data = await getProjectMessages(projectId);
    setMessages(data);
  };

  const fetchFeedback = async () => {
    if (!projectId) return;
    const data = await getProjectReviews(projectId);
    
    // Convert the data to include the required updated_at field
    const feedbackWithUpdated = data.map(item => ({
      ...item,
      updated_at: item.created_at // Use created_at as a fallback for updated_at
    }));
    
    setFeedback(feedbackWithUpdated as ProjectFeedback[]);
  };

  const fetchAnalytics = async () => {
    if (!projectId) return;
    const data = await getProjectAnalytics(projectId);
    setAnalytics(data);
  };

  const fetchNotifications = async () => {
    if (!projectId || !user?.id) return;
    const data = await getProjectNotifications(projectId, user.id);
    setNotifications(data);
  };

  const fetchDeliverables = async () => {
    if (!projectId) return;
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const deliverablesData = data.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description || '',
        // Cast the status to the allowed types for Deliverable
        status: (milestone.status === 'completed' ? 'completed' : 
                milestone.status === 'in_progress' ? 'in_progress' : 
                'not_started') as Deliverable['status'],
        due_date: milestone.due_date,
        milestone_id: milestone.id
      }));

      setDeliverables(deliverablesData);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      toast.error('Failed to load deliverables');
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: ProjectTask['status']) => {
    try {
      await updateTask(taskId, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!projectId || !user?.id) return;

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      await projectService.uploadDocument({
        project_id: projectId,
        title: file.name,
        file_url: publicUrl,
        uploaded_by: user.id
      });

      fetchDocuments();
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const handleApplyToProject = async (values: { cover_letter: string }) => {
    if (!projectId || !user?.id) return;

    try {
      await applyToProject(projectId, user.id, values.cover_letter);
      setShowApplicationModal(false);
      applicationForm.reset();
      toast.success('Application submitted successfully');
    } catch (error) {
      console.error('Error applying to project:', error);
      toast.error('Failed to submit application');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      toast.success(`Application ${status} successfully`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-2">{project.description}</p>
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">{project.category}</Badge>
              {project.payment_model && (
                <Badge variant="outline">{project.payment_model}</Badge>
              )}
            </div>
          </div>
          {isStudent && !hasApplied && (
            <Button onClick={() => setShowApplicationModal(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          {isProjectOwner && (
            <>
              <TabsTrigger value="applicants">Applicants</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </>
          )}
          {isProjectMember && (
            <>
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Project Details */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Objectives</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Timeline & Commitment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p>{new Date(project.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p>{new Date(project.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Application Status */}
          {isStudent && hasApplied && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Application Status</h2>
              <div className="flex items-center gap-4">
                <Badge variant={
                  project.applications?.find(app => app.team?.members.some(m => m.user_id === user?.id))?.status === 'accepted' ? 'default' :
                  project.applications?.find(app => app.team?.members.some(m => m.user_id === user?.id))?.status === 'shortlisted' ? 'secondary' :
                  project.applications?.find(app => app.team?.members.some(m => m.user_id === user?.id))?.status === 'rejected' ? 'destructive' :
                  'outline'
                }>
                  {project.applications?.find(app => app.team?.members.some(m => m.user_id === user?.id))?.status || 'Pending'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Applied on {new Date(project.applications?.find(app => app.team?.members.some(m => m.user_id === user?.id))?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {[...tasks, ...messages, ...feedback]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={profile?.avatarUrl} />
                        <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {'title' in item ? item.title : 'content' in item ? item.content : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Project Deliverables</h2>
            <div className="space-y-4">
              {deliverables.map((deliverable) => (
                <Card key={deliverable.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{deliverable.title}</h3>
                      <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                    </div>
                    <Badge variant={deliverable.status === 'completed' ? 'default' : 'secondary'}>
                      {deliverable.status}
                    </Badge>
                  </div>
                  {deliverable.due_date && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Due: {new Date(deliverable.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Project Timeline</h2>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-px h-full bg-border" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    {milestone.due_date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {new Date(milestone.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Applicants Tab (Startup View) */}
        {isProjectOwner && (
          <TabsContent value="applicants" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Project Applications</h2>
              <div className="space-y-4">
                {project.applications?.map((application) => (
                  <Card key={application.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{application.team?.name}</h3>
                        <div className="mt-2">
                          <h4 className="font-medium mb-2">Team Members</h4>
                          <div className="flex flex-wrap gap-2">
                            {application.team?.members.map((member) => (
                              <Badge key={member.id} variant="outline">
                                {member.user.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Show cover letter in a modal
                          setShowApplicationModal(true);
                          applicationForm.setValue('cover_letter', application.cover_letter);
                        }}
                      >
                        View Cover Letter
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        )}

        {/* Resources Tab (Startup View) */}
        {isProjectOwner && (
          <TabsContent value="resources" className="space-y-6">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Project Resources</h2>
                <Button onClick={() => setShowResourceModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </div>
              <div className="space-y-4">
                {project.resources?.map((resource) => (
                  <Card key={resource.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <Button variant="outline" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          Access Resource
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        )}

        {/* Analytics Tab (Startup View) */}
        {isProjectOwner && (
          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Project Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Task Completion Rate</h3>
                  <Progress value={(analytics?.completedTasks || 0) / (analytics?.totalTasks || 1) * 100} />
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Milestone Completion Rate</h3>
                  <Progress value={(analytics?.completedMilestones || 0) / (analytics?.totalMilestones || 1) * 100} />
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Average Feedback Rating</h3>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{analytics?.averageFeedbackRating.toFixed(1) || '0.0'}</span>
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Total Applications</h3>
                  <p className="text-2xl">{project.applications?.length || 0}</p>
                </Card>
              </div>
            </Card>
          </TabsContent>
        )}

        {/* Tasks Tab (Member View) */}
        {isProjectMember && (
          <TabsContent value="tasks" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['not_started', 'in_progress', 'completed', 'blocked'].map((status) => (
                  <Card key={status} className="p-4">
                    <h3 className="font-semibold mb-4 capitalize">{status.replace('_', ' ')}</h3>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {tasks
                          .filter((task) => task.status === status && task.assigned_to === user?.id)
                          .map((task) => (
                            <Card key={task.id} className="p-3">
                              <h4 className="font-medium">{task.title}</h4>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              )}
                              {task.due_date && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {['not_started', 'in_progress', 'completed', 'blocked'].map((newStatus) => (
                                  <Button
                                    key={newStatus}
                                    variant={task.status === newStatus ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleUpdateTaskStatus(task.id, newStatus as ProjectTask['status'])}
                                  >
                                    {newStatus.replace('_', ' ')}
                                  </Button>
                                ))}
                              </div>
                            </Card>
                          ))}
                      </div>
                    </ScrollArea>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        )}

        {/* Messages Tab (Member View) */}
        {isProjectMember && (
          <TabsContent value="messages" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Project Chat</h2>
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{message.sender?.name || message.sender_id}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2">{message.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>
        )}

        {/* Documents Tab (Applicant View) */}
        {!isProjectOwner && (
          <TabsContent value="documents" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Project Documents</h2>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        )}
                      </div>
                      <Button variant="outline" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
