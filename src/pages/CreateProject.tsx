
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
import { ProjectTemplateCard } from '@/components/project/ProjectTemplateCard';
import { ProjectBasicForm } from '@/components/project/ProjectBasicForm';
import { ProjectRequirementsForm } from '@/components/project/ProjectRequirementsForm';
import { ProjectPaymentForm } from '@/components/project/ProjectPaymentForm';
import { ProjectDeliverablesForm } from '@/components/project/ProjectDeliverablesForm';
import { PROJECT_TEMPLATES, CATEGORIES, PAYMENT_MODELS } from '@/config/projectConfig';

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
  const [activeTab, setActiveTab] = useState<string>("templates");

  // Apply template to form
  const applyTemplate = (template: typeof PROJECT_TEMPLATES[0]) => {
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="templates">Project Templates</TabsTrigger>
            <TabsTrigger value="custom">Start from Scratch</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROJECT_TEMPLATES.map((template, index) => (
                <ProjectTemplateCard 
                  key={index} 
                  template={template} 
                  categories={CATEGORIES}
                  onUseTemplate={() => applyTemplate(template)} 
                />
              ))}
              
              <Card className="border-dashed hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Custom Project</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Create a project from scratch with your own specifications
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("custom")}>
                    Start from Scratch
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" id="project-form">
            <form onSubmit={handleSubmit} className="space-y-8">
              <ProjectBasicForm 
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                category={category}
                setCategory={setCategory}
                categories={CATEGORIES}
                errors={errors}
              />
              
              <ProjectRequirementsForm
                requiredSkills={requiredSkills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                addSkill={addSkill}
                removeSkill={removeSkill}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                teamSize={teamSize}
                setTeamSize={setTeamSize}
                errors={errors}
              />
              
              <ProjectPaymentForm
                paymentModel={paymentModel}
                setPaymentModel={setPaymentModel}
                stipendAmount={stipendAmount}
                setStipendAmount={setStipendAmount}
                paymentModels={PAYMENT_MODELS}
                errors={errors}
              />
              
              <ProjectDeliverablesForm
                deliverables={deliverables}
                newDeliverable={newDeliverable}
                setNewDeliverable={setNewDeliverable}
                addDeliverable={addDeliverable}
                removeDeliverable={removeDeliverable}
                errors={errors}
              />
              
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
