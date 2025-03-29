import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, Trash } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { ProjectCategory, PaymentModel } from "@/types/database";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.enum([
    "web_development",
    "mobile_development",
    "data_science",
    "machine_learning",
    "ui_ux_design",
    "devops",
    "cybersecurity",
    "blockchain",
    "other",
  ] as [ProjectCategory, ...ProjectCategory[]]),
  startDate: z.date(),
  endDate: z.date(),
  paymentModel: z.enum([
    "hourly",
    "fixed",
    "equity",
    "unpaid",
    "stipend",
  ] as [PaymentModel, ...PaymentModel[]]),
  stipendAmount: z.number().optional(),
  requiredSkills: z.array(z.string()).min(1, { message: "At least one skill is required" }),
  teamSize: z.number().min(1, { message: "Team size must be at least 1" }),
  deliverables: z.array(z.string()).optional(),
});

type ProjectValues = z.infer<typeof projectSchema>;

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "web_development",
      startDate: new Date(),
      endDate: new Date(),
      paymentModel: "hourly",
      stipendAmount: 0,
      requiredSkills: [],
      teamSize: 1,
      deliverables: [],
    },
  });

  const onSubmit = async (values: ProjectValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the project
      await createProject({
        ...values,
        createdBy: user!.id,
      });

      // Show success message
      toast.success("Project created successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Project creation error:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding required skills
  const [skill, setSkill] = useState("");
  const handleAddSkill = () => {
    if (skill && !form.getValues().requiredSkills.includes(skill)) {
      form.setValue("requiredSkills", [...form.getValues().requiredSkills, skill]);
      setSkill("");
    }
  };

  // Handle removing required skills
  const handleRemoveSkill = (skillToRemove: string) => {
    form.setValue(
      "requiredSkills",
      form.getValues().requiredSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Handle adding deliverables
  const [deliverable, setDeliverable] = useState("");
  const handleAddDeliverable = () => {
    if (deliverable && !form.getValues().deliverables?.includes(deliverable)) {
      form.setValue("deliverables", [...(form.getValues().deliverables || []), deliverable]);
      setDeliverable("");
    }
  };

  // Handle removing deliverables
  const handleRemoveDeliverable = (deliverableToRemove: string) => {
    form.setValue(
      "deliverables",
      form.getValues().deliverables?.filter((deliverable) => deliverable !== deliverableToRemove) || []
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Project</CardTitle>
          <CardDescription>
            Fill in the details below to create a new project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="Project Description"
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
                        <SelectItem value="web_development">Web Development</SelectItem>
                        <SelectItem value="mobile_development">Mobile Development</SelectItem>
                        <SelectItem value="data_science">Data Science</SelectItem>
                        <SelectItem value="machine_learning">Machine Learning</SelectItem>
                        <SelectItem value="ui_ux_design">UI/UX Design</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="blockchain">Blockchain</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3.5 font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3.5 font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < form.getValues().startDate!
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="stipend">Stipend</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.getValues().paymentModel === "stipend" && (
                <FormField
                  control={form.control}
                  name="stipendAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stipend Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Stipend Amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div>
                <FormLabel>Required Skills</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add a skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
                {form.getValues().requiredSkills.length > 0 && (
                  <div className="flex flex-wrap mt-2">
                    {form.getValues().requiredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="mr-2 mt-2"
                      >
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FormMessage />
              </div>

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Team Size"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Deliverables</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add a deliverable"
                    value={deliverable}
                    onChange={(e) => setDeliverable(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddDeliverable}>
                    Add
                  </Button>
                </div>
                {form.getValues().deliverables && form.getValues().deliverables.length > 0 && (
                  <div className="flex flex-wrap mt-2">
                    {form.getValues().deliverables.map((deliverable) => (
                      <Badge
                        key={deliverable}
                        className="mr-2 mt-2"
                      >
                        {deliverable}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDeliverable(deliverable)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FormMessage />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProject;
