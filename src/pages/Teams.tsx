import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useProjects, Team } from "@/context/ProjectContext";
import { Users, Plus, Search, User, CheckCircle, XCircle, AlertCircle, ArrowLeft, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const teamSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  skills: z.array(z.string()).min(1, { message: "Add at least one skill" }),
});

type TeamValues = z.infer<typeof teamSchema>;

const skillCategories = {
  "Technical": [
    "React", "TypeScript", "Node.js", "Python", "Java", "C++", "JavaScript",
    "UI/UX Design", "DevOps", "Cloud Computing", "Mobile Development", "Web Development",
    "Database Management", "System Architecture", "Machine Learning", "Data Science"
  ],
  "Business & Consulting": [
    "Business Strategy", "Market Research", "Go-to-Market (GTM)", "Business Development",
    "Sales Strategy", "Consulting", "Project Management", "Product Management",
    "Business Analysis", "Financial Modeling", "Market Analysis", "Competitive Analysis",
    "Business Planning", "Growth Strategy", "Digital Marketing", "Brand Strategy"
  ],
  "Management & Operations": [
    "Agile/Scrum", "Operations Management", "Process Optimization", "Supply Chain",
    "Risk Management", "Change Management", "Stakeholder Management", "Team Leadership"
  ],
  "Industry Specific": [
    "Healthcare", "FinTech", "E-commerce", "EdTech", "CleanTech", "AI/ML",
    "Cybersecurity", "Blockchain", "IoT", "SaaS", "Enterprise Software"
  ]
};

const Teams = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { teams, createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember, getTeamInviteLink } = useProjects();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [customSkill, setCustomSkill] = useState("");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const form = useForm<TeamValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      skills: [],
    },
  });
  
  useEffect(() => {
    setIsLoading(false);
  }, [teams]);

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

  if (!user || !profile) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to view teams.</p>
            <Button onClick={() => navigate("/signin")}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateTeam = async (values: TeamValues) => {
    try {
      await createTeam({
        name: values.name,
        description: values.description,
        skills: values.skills,
        lead_id: user.id,
      });
      setShowCreateModal(false);
      form.reset();
      toast.success("Team created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    }
  };

  const handleGenerateInviteLink = async (teamId: string) => {
    try {
      const link = await getTeamInviteLink(teamId);
      setInviteLink(link);
      setSelectedTeam(teamId);
      setShowInviteModal(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invite link");
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await removeTeamMember(teamId, userId);
      toast.success("Member removed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const currentSkills = form.getValues("skills");
      if (!currentSkills.includes(customSkill.trim())) {
        form.setValue("skills", [...currentSkills, customSkill.trim()]);
      }
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Teams</h1>
              <p className="text-muted-foreground">
                Create and manage your project teams
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateInviteLink(team.id)}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{team.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {team.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Team Members</h4>
                      <div className="space-y-2">
                        {team.members?.map((member) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{member.user.name}</span>
                              <Badge variant={member.role === 'lead' ? 'default' : 'secondary'}>
                                {member.role}
                              </Badge>
                            </div>
                            {member.user_id !== user.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveMember(team.id, member.user_id)}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate(`/teams/${team.id}`)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No teams found</h3>
              <p className="mt-2 text-muted-foreground">
                Create a new team to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a team to collaborate on projects together.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTeam)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            placeholder="Search skills..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pr-10"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <ScrollArea className="h-[300px] border rounded-md p-4">
                          {Object.entries(skillCategories).map(([category, skills]) => {
                            const filteredSkills = skills.filter(skill =>
                              skill.toLowerCase().includes(searchValue.toLowerCase())
                            );
                            if (filteredSkills.length === 0) return null;
                            
                            return (
                              <div key={category} className="mb-6">
                                <h3 className="font-medium mb-2">{category}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                  {filteredSkills.map((skill) => (
                                    <div key={skill} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={skill}
                                        checked={field.value.includes(skill)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            field.onChange([...field.value, skill]);
                                          } else {
                                            field.onChange(field.value.filter(s => s !== skill));
                                          }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <label htmlFor={skill} className="text-sm">
                                        {skill}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </ScrollArea>
                        {field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select skills your team possesses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Link Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Share this link with your team members to join.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={inviteLink || ""}
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyInviteLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
