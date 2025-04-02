
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProjectValidation } from '@/hooks/useProjectValidation';
import { debugLog, debugError, logSupabaseOperation } from '@/utils/debug';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ProjectCategory, 
  PaymentModel 
} from '@/types/database';
import { PlusCircle, Code, Briefcase, BarChart3, PenTool, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { value: 'web_development', label: 'Web Development', icon: <Code className="h-4 w-4" /> },
  { value: 'mobile_development', label: 'Mobile Development', icon: <Code className="h-4 w-4" /> },
  { value: 'data_science', label: 'Data Science', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'machine_learning', label: 'Machine Learning', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'ui_ux_design', label: 'UI/UX Design', icon: <PenTool className="h-4 w-4" /> },
  { value: 'devops', label: 'DevOps', icon: <Code className="h-4 w-4" /> },
  { value: 'cybersecurity', label: 'Cybersecurity', icon: <Code className="h-4 w-4" /> },
  { value: 'blockchain', label: 'Blockchain', icon: <Code className="h-4 w-4" /> },
  { value: 'market_research', label: 'Market Research', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <Briefcase className="h-4 w-4" /> }
];

const PAYMENT_MODELS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'fixed', label: 'Fixed Amount' }
];

interface ProjectTemplate {
  title: string;
  description: string;
  category: ProjectCategory;
  required_skills: string[];
  payment_model: PaymentModel;
  deliverables: string[];
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    title: 'Website Development',
    description: 'Create a responsive website with modern UI/UX design, optimized for all devices.',
    category: 'web_development',
    required_skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    payment_model: 'fixed',
    deliverables: ['Responsive website', 'Source code', 'Documentation']
  },
  {
    title: 'Mobile App Development',
    description: 'Build a cross-platform mobile application with a user-friendly interface.',
    category: 'mobile_development',
    required_skills: ['React Native', 'JavaScript', 'UI/UX Design'],
    payment_model: 'hourly',
    deliverables: ['iOS app', 'Android app', 'Source code', 'User documentation']
  },
  {
    title: 'Data Analysis Project',
    description: 'Analyze data sets to identify trends and provide actionable insights.',
    category: 'data_science',
    required_skills: ['Python', 'SQL', 'Data Visualization', 'Statistics'],
    payment_model: 'stipend',
    deliverables: ['Data analysis report', 'Visualizations', 'Presentation', 'Recommendations']
  },
  {
    title: 'UI/UX Design Project',
    description: 'Design a modern and user-friendly interface for a digital product.',
    category: 'ui_ux_design',
    required_skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    payment_model: 'fixed',
    deliverables: ['Design mockups', 'Prototypes', 'Design system', 'User flow documentation']
  }
];

const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProject();
  const { user } = useAuth();
  const { toast } = useToast();
  const { errors, validateProject, clearErrors } = useProjectValidation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('web_development');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('unpaid');
  const [stipendAmount, setStipendAmount] = useState<number | null>(null);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("blank");

  // Apply template to form
  const applyTemplate = (template: ProjectTemplate) => {
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setRequiredSkills(template.required_skills);
    setPaymentModel(template.payment_model);
    setDeliverables(template.deliverables);
    setActiveTab("custom");
    
    // Scroll to the form
    setTimeout(() => {
      document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Add a skill to the required skills list
  const addSkill = () => {
    if (newSkill.trim() !== '') {
      if (!requiredSkills.includes(newSkill.trim())) {
        setRequiredSkills([...requiredSkills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  // Remove a skill from the required skills list
  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  // Add a deliverable to the deliverables list
  const addDeliverable = () => {
    if (newDeliverable.trim() !== '') {
      if (!deliverables.includes(newDeliverable.trim())) {
        setDeliverables([...deliverables, newDeliverable.trim()]);
      }
      setNewDeliverable('');
    }
  };

  // Remove a deliverable from the deliverables list
  const removeDeliverable = (deliverable: string) => {
    setDeliverables(deliverables.filter(d => d !== deliverable));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    debugLog('CreateProject', 'Starting project creation process');
    
    // Create project data object
    const projectData = {
      title,
      description,
      category,
      required_skills: requiredSkills,
      start_date: startDate,
      end_date: endDate,
      team_size: Number(teamSize),
      payment_model: paymentModel,
      stipend_amount: paymentModel === 'stipend' ? stipendAmount : null,
      deliverables
    };
    
    // Validate project data
    const { isValid } = validateProject(projectData);
    
    if (isValid) {
      try {
        setIsSubmitting(true);
        
        logSupabaseOperation('insert', 'projects', projectData);
        
        const result = await createProject(projectData);
        
        if (result) {
          debugLog('CreateProject', 'Project created successfully', result);
          toast({
            title: 'Success',
            description: 'Project created successfully!'
          });
          navigate('/dashboard');
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create project. Please try again.'
          });
        }
      } catch (error: any) {
        debugError('CreateProject', error, 'Failed to create project');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An unexpected error occurred'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Display a toast with validation errors
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the highlighted errors'
      });
    }
  };

  if (!user) {
    return (
      <DashboardLayout activeTab="create-project">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Not Authenticated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">You need to be logged in to create a project.</p>
              <Button className="w-full" onClick={() => navigate('/signin')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="create-project">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
        <p className="text-muted-foreground mb-8">Create a project to find the perfect team of students for your startup's needs.</p>
        
        <Tabs defaultValue="templates" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="templates">Project Templates</TabsTrigger>
            <TabsTrigger value="blank">Start from Scratch</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROJECT_TEMPLATES.map((template, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{template.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {CATEGORIES.find(c => c.value === template.category)?.icon}
                          <span className="ml-2">{CATEGORIES.find(c => c.value === template.category)?.label}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.required_skills.map((skill, i) => (
                          <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="default" 
                      className="w-full" 
                      onClick={() => applyTemplate(template)}
                    >
                      Use Template <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="border-dashed hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Custom Project</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Create a project from scratch with your own specifications
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("blank")}>
                    Start from Scratch
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="blank" id="project-form">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Project Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter project title"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Describe your project"
                      rows={4}
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                      className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      {CATEGORIES.map((categoryOption) => (
                        <option key={categoryOption.value} value={categoryOption.value}>
                          {categoryOption.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>
                </CardContent>
              </Card>
              
              {/* Project Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Required Skills */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Required Skills</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-l"
                        placeholder="Add a required skill"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-r"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {requiredSkills.map((skill) => (
                        <div key={skill} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center">
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`w-full p-2 border rounded ${errors.start_date ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                    </div>
                    
                    {/* End Date */}
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`w-full p-2 border rounded ${errors.end_date ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                    </div>
                  </div>
                  
                  {/* Team Size */}
                  <div>
                    <label htmlFor="teamSize" className="block text-sm font-medium mb-1">
                      Team Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="teamSize"
                      type="number"
                      min="1"
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                      className={`w-full p-2 border rounded ${errors.team_size ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.team_size && <p className="text-red-500 text-sm mt-1">{errors.team_size}</p>}
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Model */}
                  <div>
                    <label htmlFor="paymentModel" className="block text-sm font-medium mb-1">
                      Payment Model <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentModel"
                      value={paymentModel}
                      onChange={(e) => setPaymentModel(e.target.value as PaymentModel)}
                      className={`w-full p-2 border rounded ${errors.payment_model ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      {PAYMENT_MODELS.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    {errors.payment_model && <p className="text-red-500 text-sm mt-1">{errors.payment_model}</p>}
                  </div>
                  
                  {/* Payment Details based on selected model */}
                  {paymentModel === 'stipend' && (
                    <div>
                      <label htmlFor="stipendAmount" className="block text-sm font-medium mb-1">
                        Stipend Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="stipendAmount"
                        type="number"
                        min="0"
                        value={stipendAmount || ''}
                        onChange={(e) => setStipendAmount(parseFloat(e.target.value) || null)}
                        className={`w-full p-2 border rounded ${errors.stipend_amount ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter amount"
                      />
                      {errors.stipend_amount && <p className="text-red-500 text-sm mt-1">{errors.stipend_amount}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Deliverables */}
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deliverables <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newDeliverable}
                        onChange={(e) => setNewDeliverable(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-l"
                        placeholder="Add a deliverable"
                      />
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-r"
                      >
                        Add
                      </button>
                    </div>
                    {errors.deliverables && <p className="text-red-500 text-sm mt-1">{errors.deliverables}</p>}
                    <div className="mt-2">
                      {deliverables.length === 0 ? (
                        <p className="text-gray-500 italic">No deliverables added yet</p>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1">
                          {deliverables.map((deliverable, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex-1">{deliverable}</span>
                              <button
                                type="button"
                                onClick={() => removeDeliverable(deliverable)}
                                className="text-red-500 ml-2"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
