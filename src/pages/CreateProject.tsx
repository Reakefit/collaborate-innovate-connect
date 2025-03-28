
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useProjects, ProjectCategory, PaymentModel, Project } from "@/context/ProjectContext";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, Trash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("MVP Development");
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentModel, setPaymentModel] = useState<PaymentModel>("Pro-bono");
  const [stipendAmount, setStipendAmount] = useState<number | undefined>(undefined);
  const [skills, setSkills] = useState<string[]>([""]);
  const [teamSize, setTeamSize] = useState<number>(3);
  
  const addDeliverable = () => {
    setDeliverables([...deliverables, ""]);
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      const updated = [...deliverables];
      updated.splice(index, 1);
      setDeliverables(updated);
    }
  };

  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const updated = [...skills];
      updated.splice(index, 1);
      setSkills(updated);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!title) errors.push("Project title is required");
    if (!description || description.length < 50) errors.push("Please provide a detailed description (at least 50 characters)");
    if (!category) errors.push("Category is required");
    if (!deliverables[0]) errors.push("At least one deliverable is required");
    if (!startDate) errors.push("Start date is required");
    if (!endDate) errors.push("End date is required");
    if (new Date(startDate) > new Date(endDate)) errors.push("End date must be after start date");
    if (!paymentModel) errors.push("Payment model is required");
    if (paymentModel === "Stipend" && !stipendAmount) errors.push("Stipend amount is required");
    if (!skills[0]) errors.push("At least one required skill is required");
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty deliverables and skills
      const filteredDeliverables = deliverables.filter(d => d.trim() !== "");
      const filteredSkills = skills.filter(s => s.trim() !== "");
      
      await createProject({
        title,
        description,
        category,
        deliverables: filteredDeliverables,
        timeline: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        paymentModel,
        stipendAmount: paymentModel === "Stipend" ? stipendAmount : undefined,
        requiredSkills: filteredSkills,
        teamSize,
      });
      
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeTab="projects">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">
            Post a new project to find talented students for your startup
          </p>
        </div>

        {formErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {formErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Provide comprehensive information about your project to attract the right students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="E.g., Mobile App MVP Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the project, goals, and context..."
                    className="min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length < 50 
                      ? `Please provide at least 50 characters. Currently: ${description.length}/50` 
                      : `${description.length} characters`}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Project Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as ProjectCategory)}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
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
                </div>
              </div>

              {/* Deliverables */}
              <div className="space-y-3">
                <Label>Project Deliverables</Label>
                {deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Deliverable ${index + 1}`}
                      value={deliverable}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      required={index === 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeDeliverable(index)}
                      disabled={deliverables.length === 1 && index === 0}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDeliverable}
                  className="w-full"
                >
                  Add Deliverable
                </Button>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Payment Model */}
              <div className="space-y-3">
                <Label>Payment Model</Label>
                <RadioGroup
                  value={paymentModel}
                  onValueChange={(value) => setPaymentModel(value as PaymentModel)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Pro-bono" id="pro-bono" />
                    <Label htmlFor="pro-bono" className="cursor-pointer">Pro-bono (Volunteer)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Stipend" id="stipend" />
                    <Label htmlFor="stipend" className="cursor-pointer">Stipend</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Equity" id="equity" />
                    <Label htmlFor="equity" className="cursor-pointer">Equity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Certificate" id="certificate" />
                    <Label htmlFor="certificate" className="cursor-pointer">Certificate of Completion</Label>
                  </div>
                </RadioGroup>

                {paymentModel === "Stipend" && (
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="stipend-amount">Stipend Amount (INR)</Label>
                    <Input
                      id="stipend-amount"
                      type="number"
                      placeholder="e.g., 5000"
                      value={stipendAmount || ""}
                      onChange={(e) => setStipendAmount(parseInt(e.target.value) || undefined)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Required Skills */}
              <div className="space-y-3">
                <Label>Required Skills</Label>
                {skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      required={index === 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSkill(index)}
                      disabled={skills.length === 1 && index === 0}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="w-full"
                >
                  Add Skill
                </Button>
              </div>

              {/* Team Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="team-size">Suggested Team Size: {teamSize}</Label>
                </div>
                <Slider
                  id="team-size"
                  min={1}
                  max={10}
                  step={1}
                  value={[teamSize]}
                  onValueChange={(value) => setTeamSize(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Individual)</span>
                  <span>10 (Large Team)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Project..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
