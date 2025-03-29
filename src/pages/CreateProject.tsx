import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProjectDashboard from "@/components/layouts/ProjectDashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useProjects } from "@/context/ProjectContext";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const createProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  deliverables: z.string().min(5, { message: "Please provide at least one deliverable." }),
  startDate: z.date().min(new Date(), { message: "Start date must be in the future." }),
  endDate: z.date().min(new Date(), { message: "End date must be in the future." }),
  paymentModel: z.string().min(1, { message: "Please select a payment model." }),
  stipendAmount: z.string().optional(),
  requiredSkills: z.string().min(3, { message: "Please provide at least one required skill." }),
  teamSize: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num > 0 && num <= 10;
  }, {
    message: "Team size must be a number between 1 and 10."
  }),
}).refine((data) => {
  return data.endDate > data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

const paymentModels = [
  { value: "Pro-bono", label: "Pro-bono", description: "No payment required" },
  { value: "Stipend", label: "Stipend", description: "Fixed payment amount" },
  { value: "Equity", label: "Equity", description: "Company shares" },
  { value: "Certificate", label: "Certificate", description: "Completion certificate" },
];

const commonDeliverables = [
  "Project Documentation",
  "Source Code",
  "User Interface Design",
  "API Documentation",
  "Testing Report",
  "Deployment Guide",
  "User Manual",
  "Performance Analysis",
  "Security Audit",
  "Market Research Report",
];

const CreateProject = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState("");

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      deliverables: "",
      startDate: new Date(),
      endDate: new Date(),
      paymentModel: "",
      stipendAmount: "0",
      requiredSkills: "",
      teamSize: "1",
    },
  });

  const addDeliverable = (deliverable: string) => {
    if (deliverable.trim() && !selectedDeliverables.includes(deliverable.trim())) {
      setSelectedDeliverables([...selectedDeliverables, deliverable.trim()]);
      form.setValue("deliverables", selectedDeliverables.join(", "));
    }
    setNewDeliverable("");
  };

  const removeDeliverable = (deliverable: string) => {
    setSelectedDeliverables(selectedDeliverables.filter(d => d !== deliverable));
    form.setValue("deliverables", selectedDeliverables.filter(d => d !== deliverable).join(", "));
  };

  const onSubmit = async (values: CreateProjectValues) => {
    if (!user || !profile) {
      toast.error("You must be logged in to create a project");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category.trim(),
        deliverables: values.deliverables.split(',').map(d => d.trim()).filter(Boolean),
        start_date: values.startDate.toISOString(),
        end_date: values.endDate.toISOString(),
        payment_model: values.paymentModel.trim(),
        stipend_amount: values.paymentModel === "Stipend" && values.stipendAmount 
          ? Number(values.stipendAmount) 
          : null,
        required_skills: values.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        team_size: Number(values.teamSize),
        created_by: user.id,
        status: "open" as const,
      };

      await createProject(projectData);
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProjectDashboard>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-none shadow-lg bg-gradient-to-b from-white to-gray-50">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create New Project
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Fill in the details below to create a new project. Be specific about your requirements to attract the right talent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Project Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter a clear, concise title" 
                              className="h-11 bg-white border-gray-200 focus:border-primary" 
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
                          <FormLabel className="text-base font-medium">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-gray-200 focus:border-primary">
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
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Project Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project in detail. Include the problem you're trying to solve, your goals, and any specific requirements."
                            className="resize-none min-h-[120px] bg-white border-gray-200 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Project Details Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="paymentModel"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-base font-medium">Payment Model</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            {paymentModels.map((model) => (
                              <div
                                key={model.value}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  field.value === model.value
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary/50"
                                }`}
                                onClick={() => field.onChange(model.value)}
                              >
                                <div className="font-medium">{model.label}</div>
                                <div className="text-sm text-muted-foreground">{model.description}</div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.getValues("paymentModel") === "Stipend" && (
                      <FormField
                        control={form.control}
                        name="stipendAmount"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-base font-medium">Stipend Amount</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <FormControl>
                                <Input 
                                  placeholder="Enter stipend amount" 
                                  type="number" 
                                  min="0"
                                  step="100"
                                  className="h-11 bg-white border-gray-200 focus:border-primary pl-8"
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter team size" 
                              type="number" 
                              min="1"
                              max="10"
                              className="h-11 bg-white border-gray-200 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Start Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="h-11 bg-white border-gray-200 focus:border-primary"
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
                          <FormLabel className="text-base font-medium">End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="h-11 bg-white border-gray-200 focus:border-primary"
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-primary">Requirements</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="deliverables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Deliverables</FormLabel>
                          <div className="space-y-4">
                            <div className="flex gap-2 flex-wrap">
                              {selectedDeliverables.map((deliverable) => (
                                <Badge
                                  key={deliverable}
                                  variant="secondary"
                                  className="px-3 py-1 text-sm flex items-center gap-1"
                                >
                                  {deliverable}
                                  <button
                                    type="button"
                                    onClick={() => removeDeliverable(deliverable)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a new deliverable"
                                value={newDeliverable}
                                onChange={(e) => setNewDeliverable(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addDeliverable(newDeliverable);
                                  }
                                }}
                                className="h-11 bg-white border-gray-200 focus:border-primary"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addDeliverable(newDeliverable)}
                                className="h-11"
                              >
                                Add
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Common deliverables:
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {commonDeliverables.map((deliverable) => (
                                <Badge
                                  key={deliverable}
                                  variant="outline"
                                  className="px-3 py-1 text-sm cursor-pointer hover:bg-primary/10"
                                  onClick={() => addDeliverable(deliverable)}
                                >
                                  {deliverable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiredSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Required Skills</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., React, UI Design, Data Analysis" 
                              className="h-11 bg-white border-gray-200 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of required skills
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <CardFooter className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white px-8"
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ProjectDashboard>
  );
};

export default CreateProject;
