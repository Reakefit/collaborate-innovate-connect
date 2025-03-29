
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectMessage, Project } from "@/types/database";
import { fetchProjectMessages } from '@/services/database';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

const Messages = () => {
  const { user, profile } = useAuth();
  const { projects, applications } = useProject();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load messages for the selected project
  useEffect(() => {
    if (selectedProject) {
      loadMessages(selectedProject);
    }
  }, [selectedProject]);

  // Find projects the user is involved in (either as creator or applicant)
  const userProjects = projects.filter(project => 
    project.created_by === user?.id || 
    applications.some(app => 
      app.project_id === project.id && 
      app.status === 'accepted'
    )
  );

  const loadMessages = async (projectId: string) => {
    setLoading(true);
    try {
      const messages = await fetchProjectMessages(projectId);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedProject || !newMessage.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: selectedProject,
          sender_id: user.id,
          content: newMessage.trim()
        });
        
      if (error) throw error;
      
      // Reload messages to include the new one
      await loadMessages(selectedProject);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Project Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Select a project to view messages</CardDescription>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <p className="text-sm text-gray-500">You're not involved in any projects yet.</p>
              ) : (
                <div className="space-y-2">
                  {userProjects.map(project => (
                    <Button
                      key={project.id}
                      variant={selectedProject === project.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      {project.title}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Messages */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedProject 
                  ? userProjects.find(p => p.id === selectedProject)?.title || 'Project Messages'
                  : 'Select a project'}
              </CardTitle>
              <CardDescription>
                {selectedProject ? 'Chat with project members' : 'Select a project to view messages'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-hidden">
              {selectedProject ? (
                <ScrollArea className="h-[400px] pr-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(message => (
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
                              {message.sender?.name || 'User'} • {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </div>
                            <p>{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a project to view messages</p>
                </div>
              )}
            </CardContent>
            
            {selectedProject && (
              <CardFooter className="border-t pt-4">
                <div className="flex w-full space-x-2">
                  <Input 
                    placeholder="Type your message..." 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
