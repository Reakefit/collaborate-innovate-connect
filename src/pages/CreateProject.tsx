
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useProjects, ProjectCategory, PaymentModel, Project } from "@/context/ProjectContext";

const createProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.enum([
    "MVP Development",
    "Market Research",
    "GTM Strategy",
    "Design",
    "Content Creation",
    "Social Media",
    "Data Analysis",
    "Other",
  ]),
  deliverables: z.string().min(5, { message: "Please provide at least one deliverable." }),
  startDate: z.date(),
  endDate: z.date(),
  paymentModel: z.enum(["Pro-bono", "Stipend", "Equity", "Certificate"]),
  stipendAmount: z.string().optional(),
  requiredSkills: z.string().min(3, { message: "Please provide at least one required skill." }),
  teamSize: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "Team size must be a number greater than 0."
  }),
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

const CreateProject = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "MVP Development",
      deliverables: "",
      startDate: new Date(),
      endDate: new Date(),
      paymentModel: "Pro-bono",
      stipendAmount: "0",
      requiredSkills: "",
      teamSize: "1",
    },
  });

  const onSubmit = async (values: CreateProjectValues) => {
    try {
      setIsSubmitting(true);
      
      if (!profile) {
        toast.error("User profile not found");
        return;
      }
      
      // Convert form data to project format
      const projectData = {
        title: values.title,
        description: values.description,
        category: values.category as ProjectCategory,
        deliverables: values.deliverables.split('\n').filter(Boolean),
        start_date: values.startDate,
        end_date: values.endDate,
        paymentModel: values.paymentModel as PaymentModel,
        stipendAmount: values.paymentModel === "Stipend" ? Number(values.stipendAmount) : undefined,
        requiredSkills: values.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        teamSize: Number(values.teamSize),
        createdBy: {
          id: profile.id,
          name: profile.name,
          companyName: profile.company_name
        }
      };
      
      await createProject(projectData);
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeTab="create-project">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Project</CardTitle>
            <CardDescription>
              Fill in the details below to create a new project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project Title" {...field} />
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
                        <Textarea
                          placeholder="Describe the project in detail"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MVP Development">MVP Development</SelectItem>
                          <SelectItem value="Market Research">Market Research</SelectItem>
                          <SelectItem value="GTM Strategy">GTM Strategy</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Content Creation">Content Creation</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliverables (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the project deliverables"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify what the project aims to deliver.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pro-bono">Pro-bono</SelectItem>
                          <SelectItem value="Stipend">Stipend</SelectItem>
                          <SelectItem value="Equity">Equity</SelectItem>
                          <SelectItem value="Certificate">Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.getValues("paymentModel") === "Stipend" && (
                  <FormField
                    control={form.control}
                    name="stipendAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stipend Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter stipend amount" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="requiredSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Skills (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., React, UI Design, Data Analysis" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify the skills required for the project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Size</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team size" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
