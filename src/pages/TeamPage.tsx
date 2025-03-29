
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Team, TeamMessage, TeamTask, TeamTaskStatus } from '@/types/database';
import { fetchTeamById, fetchTeamMessages, fetchTeamTasks } from '@/services/database';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { PlusCircle, Send, Trash2, User } from 'lucide-react';

const TeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Load team data
  useEffect(() => {
    if (id) {
      loadTeamData(id);
    }
  }, [id]);

  const loadTeamData = async (teamId: string) => {
    setLoading(true);
    try {
      const teamData = await fetchTeamById(teamId);
      const messagesData = await fetchTeamMessages(teamId);
      const tasksData = await fetchTeamTasks(teamId);
      
      if (teamData) {
        setTeam(teamData);
        setMessages(messagesData);
        setTasks(tasksData);
      } else {
        toast.error('Team not found');
        navigate('/teams');
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !team || !newMessage.trim()) return;
    
    try {
      const { error } = await supabase
        .from('team_messages')
        .insert({
          team_id: team.id,
          sender_id: user.id,
          content: newMessage.trim()
        });
      
      if (error) throw error;
      
      await loadTeamData(team.id);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const createTask = async () => {
    if (!user || !team || !newTaskTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('team_tasks')
        .insert({
          team_id: team.id,
          title: newTaskTitle.trim(),
          status: 'todo' as TeamTaskStatus,
          created_by: user.id
        });
      
      if (error) throw error;
      
      await loadTeamData(team.id);
      setNewTaskTitle('');
      toast.success('Task created');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId: string, status: TeamTaskStatus) => {
    if (!team) return;
    
    try {
      const { error } = await supabase
        .from('team_tasks')
        .update({ status })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update tasks locally for immediate feedback
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!team) return;
    
    try {
      const { error } = await supabase
        .from('team_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update tasks locally for immediate feedback
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const isTeamLead = team?.lead_id === user?.id;
  
  if (loading) {
    return <div className="container mx-auto py-8">Loading team data...</div>;
  }
  
  if (!team) {
    return <div className="container mx-auto py-8">Team not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-gray-500">{team.description}</p>
        </div>
        <div className="mt-4 md:mt-0">
          {isTeamLead && (
            <Button variant="outline" onClick={() => navigate(`/teams/${team.id}/edit`)}>
              Edit Team
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="w-full md:w-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Basic information about the team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{team.description}</p>
              </div>
              
              {team.skills && team.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {team.portfolio_url && (
                <div>
                  <h3 className="font-semibold">Portfolio</h3>
                  <a 
                    href={team.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {team.portfolio_url}
                  </a>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold">Created</h3>
                <p>{format(new Date(team.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent messages and task updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 && tasks.length === 0 ? (
                <p className="text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <Avatar>
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback>{message.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{message.sender?.name || 'Unknown User'}</p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(task.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge>{task.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setCurrentTab('chat')}>
                  View All Messages
                </Button>
                <Button variant="outline" onClick={() => setCurrentTab('tasks')}>
                  View All Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Members of this team</CardDescription>
              </div>
              {isTeamLead && (
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members && team.members.length > 0 ? (
                  team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                          <Badge variant="outline" className="text-xs">
                            {member.role} • {member.status}
                          </Badge>
                        </div>
                      </div>
                      {isTeamLead && member.user_id !== user?.id && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No members in this team yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-6">
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>Communicate with your team</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[300px] pr-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {message.sender?.name || 'Unknown'} • {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </div>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-3">
              <div className="flex w-full gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Tasks</CardTitle>
              <CardDescription>Manage tasks for this team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a new task..." 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createTask();
                    }
                  }}
                />
                <Button onClick={createTask}>Add</Button>
              </div>
              
              {tasks.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">No tasks yet. Add one above!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="font-semibold mb-2">To Do</h3>
                    <div className="space-y-2">
                      {tasks
                        .filter(task => task.status === 'todo')
                        .map(task => (
                          <div key={task.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{task.title}</p>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                >
                                  Start
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500" 
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                            {task.due_date && (
                              <p className="text-xs text-gray-500 mt-2">
                                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">In Progress / Done</h3>
                    <div className="space-y-2">
                      {tasks
                        .filter(task => task.status !== 'todo')
                        .map(task => (
                          <div key={task.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <Badge variant="outline" className="mt-1">{task.status}</Badge>
                              </div>
                              <div className="flex gap-1">
                                {task.status === 'in_progress' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                  >
                                    Complete
                                  </Button>
                                )}
                                {(task.status === 'completed' || task.status === 'done') && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => updateTaskStatus(task.id, 'todo')}
                                  >
                                    Reopen
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500" 
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                            {task.due_date && (
                              <p className="text-xs text-gray-500 mt-2">
                                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamPage;
