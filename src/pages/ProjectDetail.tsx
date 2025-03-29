import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useProject } from "@/context/ProjectContext";
import { Project, Application, ProjectMilestone } from "@/types/database";
import { MessageSquare, User, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Send, ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const applicationSchema = z.object({
  teamId: z.string().min(1, { message: "Please select a team" }),
  coverLetter: z.string().min(500, { message: "Cover letter must be at least 500 characters" }),
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
  const { projects, teams, applications, applyToProject, updateApplicationStatus } = useProject();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const project = projects.find(p => p.id === id);
  const userTeams = teams.filter(team => 
    team.members?.some(member => member.user_id === user?.id && member.status === 'active')
  );
  const projectApplications = applications.filter(a => a.project_id === id);

  const applicationForm = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      teamId: "",
      coverLetter: "",
    },
  });

  useEffect(() => {
    if (project) {
      setIsLoading(false);
    }
  }, [project]);

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

  if (!project) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Project Not Found</h2>
            <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleApply = async (values: ApplicationValues) => {
    try {
      await applyToProject(project!.id, values.teamId, values.coverLetter);
      setShowApplyModal(false);
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status} successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update application status");
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground">
                {project.description}
              </p>
            </div>
            {user && profile?.role === "student" && (
              <Button onClick={() => setShowApplyModal(true)}>
                Apply Now
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <p className="text-muted-foreground">{project.category}</p>
                  </div>
                  {project.deliverables && project.deliverables.length > 0 && (
                    <div>
                      <h3 className="font-medium">Deliverables</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {project.deliverables.map((deliverable, index) => (
                          <li key={index}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.start_date && project.end_date && (
                    <div>
                      <h3 className="font-medium">Timeline</h3>
                      <p className="text-muted-foreground">
                        {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {project.payment_model && (
                    <div>
                      <h3 className="font-medium">Payment Model</h3>
                      <p className="text-muted-foreground">
                        {project.payment_model}
                        {project.payment_model === "Stipend" && project.stipend_amount && ` (${project.stipend_amount})`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Applications</h2>
                {projectApplications.length > 0 ? (
                  <div className="space-y-4">
                    {projectApplications.map((application) => (
                      <Card key={application.id} className="border-none shadow-lg">
                        <CardHeader>
                          <CardTitle>{application.team?.name}</CardTitle>
                          <CardDescription>
                            {application.team?.members?.length || 0} members
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2">Team Members</h3>
                              <div className="space-y-2">
                                {application.team?.members?.map((member) => (
                                  <div key={member.id} className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{member.name || member.user?.name}</span>
                                    {member.role === 'lead' && (
                                      <Badge variant="secondary">Team Lead</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium mb-2">Cover Letter</h3>
                              <p className="text-sm text-muted-foreground">
                                {application.cover_letter}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Badge variant={application.status === 'accepted' ? 'default' : application.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {application.status}
                              </Badge>
                            </div>
                            {user?.id === project.created_by && application.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                                >
                                  Accept
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-none shadow-lg bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <Users className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        Be the first team to apply for this project. Showcase your skills and experience to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Apply to Project</DialogTitle>
              <DialogDescription>
                Submit your team's application for this project. Make sure to highlight your team's skills and experience.
              </DialogDescription>
            </DialogHeader>
            <Form {...applicationForm}>
              <form onSubmit={applicationForm.handleSubmit(handleApply)} className="space-y-4">
                <FormField
                  control={applicationForm.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} ({team.members?.length || 0} members)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={applicationForm.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Letter</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why your team is the best fit for this project..."
                          className="min-h-[200px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 500 characters required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Submit Application
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectDetail;
