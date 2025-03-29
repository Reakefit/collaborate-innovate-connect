import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TeamMessage, TeamTask, TeamRole, TeamMemberStatus } from '@/types/database';

interface Team {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url?: string | null;
  achievements?: any;
  members?: {
    id: string;
    user_id: string;
    role: TeamRole;
    status: TeamMemberStatus;
    user: {
      name: string;
    };
  }[];
  created_at: string;
  updated_at: string;
}

const messageSchema = z.object({
  content: z.string().min(1, 'Message is required'),
});

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
      fetchMessages();
      fetchTasks();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            id,
            user_id,
            role,
            status,
            user:profiles(name, avatar_url)
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      setTeam(data as Team);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select(`
          *,
          sender:profiles(name, avatar_url)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    // Transform the data to match the TeamMessage type
    const typedMessages: TeamMessage[] = data.map(message => ({
      ...message,
      sender: message.sender ? {
        name: typeof message.sender === 'object' && message.sender.name ? message.sender.name : 'Unknown',
        avatar_url: typeof message.sender === 'object' && message.sender.avatar_url ? message.sender.avatar_url : undefined
      } : { name: 'Unknown' }
    }));

    setMessages(typedMessages);
  } catch (error) {
    console.error('Error fetching team messages:', error);
    toast.error('Failed to load team messages');
  }
};

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('team_tasks')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the TeamTask type with proper status
    const typedTasks = data.map(task => ({
      ...task,
      status: (task.status === 'todo' || task.status === 'in_progress' || 
              task.status === 'review' || task.status === 'done') 
              ? task.status 
              : 'todo' // Default status
    }));

    setTasks(typedTasks as TeamTask[]);
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    toast.error('Failed to load team tasks');
  }
};

  const handleSendMessage = async (values: z.infer<typeof messageSchema>) => {
    if (!teamId || !user?.id) return;

    try {
      const { error } = await supabase
        .from('team_messages')
        .insert({
          team_id: teamId,
          sender_id: user.id,
          content: values.content
        });

      if (error) throw error;
      messageForm.reset();
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!team) {
    return <div className="flex items-center justify-center min-h-screen">Team not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">{team.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {team.members?.map((member) => (
                <div key={member.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.user.user.avatar_url} />
                    <AvatarFallback>{member.user.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user.user.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <p className="text-sm text-muted-foreground">Status: {task.status}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback>{message.sender?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{message.sender?.name}</p>
                        <p className="text-sm text-muted-foreground">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
                <Button type="submit">Send</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
