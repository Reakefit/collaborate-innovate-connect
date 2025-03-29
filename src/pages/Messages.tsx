import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useProjects, Message, Project } from "@/context/ProjectContext";
import { toast } from "sonner";
import { Search, Send, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, messages, sendMessage } = useProjects();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [projectMessages, setProjectMessages] = useState<Message[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get projects the user is involved in
  useEffect(() => {
    if (user) {
      const filtered = projects.filter(project => 
        project.created_by === user.id || // User is creator
        project.applications?.some(app => 
          app.members?.some(m => m.id === user.id) || app.team_lead === user.id
        )
      );
      setUserProjects(filtered);
      
      // Select the first project by default if there are any
      if (filtered.length > 0 && !selectedProjectId) {
        setSelectedProjectId(filtered[0].id);
      }
    }
  }, [user, projects, selectedProjectId]);
  
  // Load messages for selected project
  useEffect(() => {
    if (selectedProjectId && messages[selectedProjectId]) {
      setProjectMessages(messages[selectedProjectId]);
    } else {
      setProjectMessages([]);
    }
  }, [selectedProjectId, messages]);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const handleSendMessage = async () => {
    if (!selectedProjectId || !newMessage.trim()) return;
    
    try {
      await sendMessage(selectedProjectId, newMessage);
      setNewMessage("");
      
      // Update local messages
      if (messages[selectedProjectId]) {
        setProjectMessages(messages[selectedProjectId]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };
  
  // Filter projects by search term
  const filteredProjects = userProjects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">Messages</h1>
            <p className="text-lg text-muted-foreground">
              Communicate with project teams and stakeholders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[70vh]">
            {/* Projects List */}
            <Card className="md:col-span-1 overflow-hidden flex flex-col border-none shadow-lg">
              <CardHeader className="space-y-2 pb-2">
                <CardTitle className="text-lg">Projects</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search projects..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-2">
                {filteredProjects.length > 0 ? (
                  <div className="space-y-1">
                    {filteredProjects.map((project) => (
                      <Button
                        key={project.id}
                        variant={selectedProjectId === project.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto py-3 px-2"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {project.created_by === user?.id ? "You" : "Team"} • {project.status}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No projects match your search" : "No projects found"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Messages */}
            <Card className="md:col-span-3 flex flex-col overflow-hidden border-none shadow-lg">
              {selectedProjectId ? (
                <>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {userProjects.find(p => p.id === selectedProjectId)?.title || "Project Messages"}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4 border-t space-y-4">
                    {projectMessages.length > 0 ? (
                      projectMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          {message.sender_id !== user?.id && (
                            <Avatar className="h-8 w-8 mr-2 mt-0.5">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(message.sender_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="text-xs mb-1 opacity-70">
                              {message.sender_id !== user?.id && `${message.sender_name} • `}
                              {new Date(message.created_at).toLocaleString()}
                            </div>
                            <p>{message.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    )}
                  </CardContent>
                  
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Select a project to view messages
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
