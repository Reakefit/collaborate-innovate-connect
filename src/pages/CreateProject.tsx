import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { ProjectCategory, PaymentModel } from "@/types/database";
import { toast } from 'sonner';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  
  // Project state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('web_development');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('unpaid');
  const [stipendAmount, setStipendAmount] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [equityPercentage, setEquityPercentage] = useState('');
  const [teamSize, setTeamSize] = useState(1);

  const handleDeliverableAdd = () => {
    if (newDeliverable.trim() !== '') {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const handleDeliverableRemove = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSkillAdd = () => {
    if (newSkill.trim() !== '') {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSkillRemove = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title) {
      toast.error('Please enter a project title');
      return false;
    }
    if (!description) {
      toast.error('Please enter a project description');
      return false;
    }
    if (!startDate) {
      toast.error('Please select a start date');
      return false;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return false;
    }
    if (startDate && endDate && startDate > endDate) {
      toast.error('End date must be after start date');
      return false;
    }
    if (paymentModel === 'stipend' && !stipendAmount) {
      toast.error('Please enter a stipend amount');
      return false;
    }
    if (paymentModel === 'hourly' && !hourlyRate) {
      toast.error('Please enter an hourly rate');
      return false;
    }
    if (paymentModel === 'fixed' && !fixedAmount) {
      toast.error('Please enter a fixed amount');
      return false;
    }
    if (paymentModel === 'equity' && !equityPercentage) {
      toast.error('Please enter an equity percentage');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    try {
      setIsLoading(true);
      
      const projectData = {
        title,
        description,
        category,
        deliverables,
        required_skills: requiredSkills,
        start_date: startDate?.toISOString() || new Date().toISOString(),
        end_date: endDate?.toISOString() || new Date().toISOString(),
        payment_model: paymentModel,
        stipend_amount: paymentModel === 'stipend' ? stipendAmount : undefined,
        hourly_rate: paymentModel === 'hourly' ? hourlyRate : undefined,
        fixed_amount: paymentModel === 'fixed' ? fixedAmount : undefined,
        equity_percentage: paymentModel === 'equity' ? equityPercentage : undefined,
        status: 'open',
        created_by: user.id,
        team_size: teamSize
      };
      
      const newProject = await createProject(projectData);
      toast.success('Project created successfully');
      navigate(`/project/${newProject.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error creating project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create a New Project</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the basic details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a concise title for your project"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project in detail"
                    className="min-h-32"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Project Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as ProjectCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Select value={teamSize.toString()} onValueChange={(value) => setTeamSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Student</SelectItem>
                      <SelectItem value="2">2 Students</SelectItem>
                      <SelectItem value="3">3 Students</SelectItem>
                      <SelectItem value="4">4 Students</SelectItem>
                      <SelectItem value="5">5+ Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Project Deliverables</CardTitle>
                <CardDescription>
                  What are the expected outputs of this project?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Add a deliverable"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleDeliverableAdd();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleDeliverableAdd}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {deliverables.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {deliverables.map((deliverable, index) => (
                      <Badge key={index} variant="secondary" className="p-2 flex items-center gap-2">
                        {deliverable}
                        <button
                          type="button"
                          onClick={() => handleDeliverableRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No deliverables added yet.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>
                  What skills are needed for this project?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a required skill"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSkillAdd();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleSkillAdd}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="p-2 flex items-center gap-2">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  When will this project start and end?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => {
                            return startDate ? date < startDate : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Model */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Model</CardTitle>
                <CardDescription>
                  How will students be compensated for this project?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentModel">Payment Type</Label>
                  <Select value={paymentModel} onValueChange={(value) => setPaymentModel(value as PaymentModel)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid (Experience Only)</SelectItem>
                      <SelectItem value="stipend">Stipend</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentModel === 'stipend' && (
                  <div className="space-y-2">
                    <Label htmlFor="stipendAmount">Stipend Amount ($)</Label>
                    <Input
                      id="stipendAmount"
                      type="text"
                      value={stipendAmount}
                      onChange={(e) => setStipendAmount(e.target.value)}
                      placeholder="e.g. 500"
                    />
                  </div>
                )}
                
                {paymentModel === 'hourly' && (
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($/hour)</Label>
                    <Input
                      id="hourlyRate"
                      type="text"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 15"
                    />
                  </div>
                )}
                
                {paymentModel === 'fixed' && (
                  <div className="space-y-2">
                    <Label htmlFor="fixedAmount">Fixed Amount ($)</Label>
                    <Input
                      id="fixedAmount"
                      type="text"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      placeholder="e.g. 1000"
                    />
                  </div>
                )}
                
                {paymentModel === 'equity' && (
                  <div className="space-y-2">
                    <Label htmlFor="equityPercentage">Equity Percentage (%)</Label>
                    <Input
                      id="equityPercentage"
                      type="text"
                      value={equityPercentage}
                      onChange={(e) => setEquityPercentage(e.target.value)}
                      placeholder="e.g. 0.5"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
