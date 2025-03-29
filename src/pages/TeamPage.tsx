import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Team, TeamMember } from '@/services/database';
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
import { Loader2 } from 'lucide-react';

type TeamRole = 'lead' | 'member';

interface TeamTask {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date?: string;
  created_by: string;
  created_at: string;
}

interface TeamAnnouncement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

interface TeamMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: {
    name: string;
    avatar_url?: string;
  };
}

interface TeamDocument {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams } = useProjects();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [announcements, setAnnouncements] = useState<TeamAnnouncement[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [documents, setDocuments] = useState<TeamDocument[]>([]);

  const team = teams.find(t => t.id === teamId);
  const isTeamLead = team?.lead_id === user?.id;

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTasks(),
        fetchAnnouncements(),
        fetchMessages(),
        fetchDocuments()
      ]);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('team_tasks')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTasks(data || []);
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('team_announcements')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAnnouncements(data || []);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('team_messages')
      .select(`
        *,
        sender:profiles(name, avatar_url)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setMessages(data || []);
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('team_documents')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setDocuments(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !teamId) return;

    try {
      const { error } = await supabase
        .from('team_messages')
        .insert({
          team_id: teamId,
          content: newMessage,
          sender_id: user?.id
        });

      if (error) throw error;
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !teamId) return;

    try {
      const { error } = await supabase
        .from('team_tasks')
        .insert({
          team_id: teamId,
          title: newTask.title,
          description: newTask.description,
          due_date: newTask.due_date,
          status: 'todo',
          created_by: user?.id
        });

      if (error) throw error;
      setNewTask({ title: '', description: '', due_date: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim() || !teamId) return;

    try {
      const { error } = await supabase
        .from('team_announcements')
        .insert({
          team_id: teamId,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          created_by: user?.id
        });

      if (error) throw error;
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TeamTask['status']) => {
    try {
      const { error } = await supabase
        .from('team_tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Team not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Team Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground mt-2">{team.description}</p>
        <div className="flex gap-2 mt-4">
          {team.skills?.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold">Total Tasks</h3>
              <p className="text-2xl">{tasks.length}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold">Team Members</h3>
              <p className="text-2xl">{team.members?.length || 0}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold">Completion Rate</h3>
              <Progress value={75} className="mt-2" />
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {[...tasks, ...announcements, ...messages]
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

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {isTeamLead && (
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Textarea
                  placeholder="Task Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['todo', 'in_progress', 'review', 'done'].map((status) => (
              <Card key={status} className="p-4">
                <h3 className="font-semibold mb-4 capitalize">{status.replace('_', ' ')}</h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {tasks
                      .filter((task) => task.status === status)
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
                            {['todo', 'in_progress', 'review', 'done'].map((newStatus) => (
                              <Button
                                key={newStatus}
                                variant={task.status === newStatus ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleUpdateTaskStatus(task.id, newStatus as TeamTask['status'])}
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
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Team Chat</h2>
            <ScrollArea className="h-[400px] mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={message.sender.avatar_url} />
                      <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{message.sender.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                      <p className="mt-1">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Team Documents</h2>
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
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.members?.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <Badge variant={member.role === 'lead' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 