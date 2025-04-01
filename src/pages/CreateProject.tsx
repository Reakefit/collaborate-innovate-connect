
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProjectValidation } from '@/hooks/useProjectValidation';
import { debugLog, debugError, logSupabaseOperation } from '@/utils/debug';
import { 
  ProjectCategory, 
  PaymentModel 
} from '@/types/database';

const CATEGORIES = [
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'ui_ux_design', label: 'UI/UX Design' },
  { value: 'devops', label: 'DevOps' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'other', label: 'Other' }
];

const PAYMENT_MODELS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'equity', label: 'Equity' }
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
  const [equityPercentage, setEquityPercentage] = useState<number | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [fixedAmount, setFixedAmount] = useState<number | null>(null);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      equity_percentage: paymentModel === 'equity' ? equityPercentage : null,
      hourly_rate: paymentModel === 'hourly' ? hourlyRate : null,
      fixed_amount: paymentModel === 'fixed' ? fixedAmount : null,
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
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
        
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
              
              {paymentModel === 'equity' && (
                <div>
                  <label htmlFor="equityPercentage" className="block text-sm font-medium mb-1">
                    Equity Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="equityPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={equityPercentage || ''}
                    onChange={(e) => setEquityPercentage(parseFloat(e.target.value) || null)}
                    className={`w-full p-2 border rounded ${errors.equity_percentage ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter percentage"
                  />
                  {errors.equity_percentage && <p className="text-red-500 text-sm mt-1">{errors.equity_percentage}</p>}
                </div>
              )}
              
              {paymentModel === 'hourly' && (
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
                    Hourly Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    value={hourlyRate || ''}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || null)}
                    className={`w-full p-2 border rounded ${errors.hourly_rate ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter hourly rate"
                  />
                  {errors.hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.hourly_rate}</p>}
                </div>
              )}
              
              {paymentModel === 'fixed' && (
                <div>
                  <label htmlFor="fixedAmount" className="block text-sm font-medium mb-1">
                    Fixed Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fixedAmount"
                    type="number"
                    min="0"
                    value={fixedAmount || ''}
                    onChange={(e) => setFixedAmount(parseFloat(e.target.value) || null)}
                    className={`w-full p-2 border rounded ${errors.fixed_amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter fixed amount"
                  />
                  {errors.fixed_amount && <p className="text-red-500 text-sm mt-1">{errors.fixed_amount}</p>}
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
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
