
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProjectCategory, PaymentModel } from '@/types/database';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckIcon,
  Loader2,
  ChevronRightIcon,
  Lightbulb,
  Code,
  PenTool,
  LineChart,
  Smartphone,
  ShieldCheck,
  Rocket,
  Globe,
} from 'lucide-react';

export default function CreateProjectPage() {
  return (
    <ProtectedRoute requiredRole="startup" requiredPermission="create_project">
      <CreateProjectContent />
    </ProtectedRoute>
  );
}

// Project templates to offer quick starts
const projectTemplates = [
  {
    id: 'market_research',
    title: 'Market Research & Validation',
    description: 'Conduct market research to validate your business idea, identify target customers, and analyze competitors.',
    category: 'market_research',
    skills: ['market_research', 'business_analysis', 'user_interviews', 'competitive_analysis'],
    deliverables: ['Market Analysis Report', 'Competitive Landscape Analysis', 'User Persona Development', 'Validation Findings'],
    duration: 4, // weeks
    teamSize: 2,
    icon: <Lightbulb className="h-8 w-8 text-amber-500" />
  },
  {
    id: 'mvp_development',
    title: 'MVP Development',
    description: 'Build a minimum viable product to demonstrate your core functionality and test with early adopters.',
    category: 'web_development',
    skills: ['javascript', 'react', 'node_js', 'product_management'],
    deliverables: ['Functional MVP', 'Source Code', 'Technical Documentation', 'User Testing Feedback'],
    duration: 8,
    teamSize: 3,
    icon: <Code className="h-8 w-8 text-blue-500" />
  },
  {
    id: 'ui_ux_design',
    title: 'UI/UX Design',
    description: 'Create user-centered designs and interfaces to enhance user experience and visual appeal.',
    category: 'ui_ux_design',
    skills: ['ui_design', 'ux_design', 'figma', 'user_testing'],
    deliverables: ['UI Design System', 'Wireframes', 'Interactive Prototype', 'User Testing Results'],
    duration: 4,
    teamSize: 2,
    icon: <PenTool className="h-8 w-8 text-purple-500" />
  },
  {
    id: 'data_analysis',
    title: 'Data Analysis & Insights',
    description: 'Analyze your data to uncover insights that can drive business decisions and growth strategies.',
    category: 'data_science',
    skills: ['data_analysis', 'python', 'data_visualization', 'sql'],
    deliverables: ['Data Analysis Report', 'Interactive Dashboard', 'Key Insights Summary', 'Recommendations'],
    duration: 4,
    teamSize: 2,
    icon: <LineChart className="h-8 w-8 text-green-500" />
  },
  {
    id: 'mobile_app',
    title: 'Mobile App Development',
    description: 'Develop a mobile application for iOS and/or Android platforms.',
    category: 'mobile_development',
    skills: ['react_native', 'flutter', 'ios', 'android'],
    deliverables: ['Mobile Application', 'Source Code', 'App Store Submission', 'Testing Documentation'],
    duration: 8,
    teamSize: 3,
    icon: <Smartphone className="h-8 w-8 text-indigo-500" />
  },
  {
    id: 'cybersecurity',
    title: 'Security Assessment',
    description: 'Evaluate your system security, identify vulnerabilities, and implement security best practices.',
    category: 'cybersecurity',
    skills: ['penetration_testing', 'security_audit', 'risk_assessment', 'compliance'],
    deliverables: ['Security Audit Report', 'Vulnerability Assessment', 'Remediation Plan', 'Security Guidelines'],
    duration: 3,
    teamSize: 2,
    icon: <ShieldCheck className="h-8 w-8 text-red-500" />
  },
  {
    id: 'gtm_strategy',
    title: 'Go-to-Market Strategy',
    description: 'Develop a comprehensive strategy to launch or scale your product in the market.',
    category: 'other',
    skills: ['marketing_strategy', 'market_research', 'competitor_analysis', 'pricing_strategy'],
    deliverables: ['GTM Strategy Document', 'Marketing Plan', 'Launch Timeline', 'KPI Framework'],
    duration: 4,
    teamSize: 2,
    icon: <Rocket className="h-8 w-8 text-orange-500" />
  },
  {
    id: 'custom',
    title: 'Custom Project',
    description: 'Define your own project with custom requirements and deliverables.',
    category: 'other',
    skills: [],
    deliverables: [],
    duration: 0,
    teamSize: 0,
    icon: <Globe className="h-8 w-8 text-gray-500" />
  }
];

// Available skill options
const skillOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'node_js', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c++', label: 'C++' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'aws', label: 'AWS' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'git', label: 'Git' },
  { value: 'ui_design', label: 'UI Design' },
  { value: 'ux_design', label: 'UX Design' },
  { value: 'product_management', label: 'Product Management' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'data_visualization', label: 'Data Visualization' },
  { value: 'figma', label: 'Figma' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'seo', label: 'SEO' },
];

// Template deliverable options
const deliverableOptions = [
  { value: 'market_analysis', label: 'Market Analysis Report' },
  { value: 'competitive_analysis', label: 'Competitive Analysis' },
  { value: 'user_personas', label: 'User Personas' },
  { value: 'mvp', label: 'Minimum Viable Product (MVP)' },
  { value: 'source_code', label: 'Source Code' },
  { value: 'documentation', label: 'Technical Documentation' },
  { value: 'ui_design', label: 'UI Design' },
  { value: 'wireframes', label: 'Wireframes' },
  { value: 'prototype', label: 'Interactive Prototype' },
  { value: 'mobile_app', label: 'Mobile Application' },
  { value: 'data_analysis', label: 'Data Analysis Report' },
  { value: 'dashboard', label: 'Interactive Dashboard' },
  { value: 'marketing_plan', label: 'Marketing Plan' },
  { value: 'content_strategy', label: 'Content Strategy' },
  { value: 'social_media_plan', label: 'Social Media Plan' },
  { value: 'seo_recommendations', label: 'SEO Recommendations' },
  { value: 'security_audit', label: 'Security Audit' },
  { value: 'testing_report', label: 'Testing Report' },
  { value: 'analytics_setup', label: 'Analytics Setup' },
];

// This is the actual content that will only be shown to authorized users
function CreateProjectContent() {
  const { user } = useAuth();
  const { createProject } = useProject();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('templates');

  // Set up form with react-hook-form
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      deliverables: [],
      required_skills: [],
      start_date: '',
      end_date: '',
      payment_model: 'unpaid',
      stipend_amount: '',
      equity_percentage: '',
      hourly_rate: '',
      fixed_amount: '',
      team_size: 2,
    }
  });

  // Apply template to form
  const applyTemplate = (templateId) => {
    const template = projectTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    setSelectedTemplate(template);
    
    // If it's the custom template, don't prefill anything
    if (templateId === 'custom') {
      setActiveTab('details');
      return;
    }
    
    // Calculate end date from duration (weeks)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (template.duration * 7));
    
    // Format dates as YYYY-MM-DD for input fields
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Update form with template data
    form.reset({
      title: template.title,
      description: template.description,
      category: template.category,
      deliverables: template.deliverables,
      required_skills: template.skills,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      payment_model: 'unpaid',
      stipend_amount: '',
      equity_percentage: '',
      hourly_rate: '',
      fixed_amount: '',
      team_size: template.teamSize,
    });
    
    setActiveTab('details');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const projectData = {
        ...data,
        created_by: user.id,
      };

      await createProject(projectData);
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create a New Project</h1>
        <p className="text-muted-foreground mt-1">Select a template or create a custom project to get started.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Choose Template</TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => applyTemplate(template.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    {template.icon}
                    {selectedTemplate?.id === template.id && (
                      <CheckIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
                {template.id !== 'custom' && (
                  <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0">
                    <div>Duration: ~{template.duration} weeks</div>
                    <div>Team: {template.teamSize} people</div>
                  </CardFooter>
                )}
                <div className="p-3 bg-muted/50 flex justify-end border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTemplate(template.id);
                    }}
                  >
                    Select <ChevronRightIcon className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setActiveTab('details')} 
              disabled={!selectedTemplate}
            >
              Continue to Details
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Fill in the details below to post your project.
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a descriptive title" {...field} />
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
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the project, goals, and what you're looking for"
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <SelectItem value="market_research">Market Research</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="team_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of students needed for this project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="required_skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Skills</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={skillOptions}
                            placeholder="Select required skills"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deliverables</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={deliverableOptions}
                            placeholder="Select expected deliverables"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="payment_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid (Experience Only)</SelectItem>
                            <SelectItem value="stipend">Stipend</SelectItem>
                            <SelectItem value="hourly">Hourly Rate</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="equity">Equity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('payment_model') === 'stipend' && (
                    <FormField
                      control={form.control}
                      name="stipend_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stipend Amount</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('payment_model') === 'hourly' && (
                    <FormField
                      control={form.control}
                      name="hourly_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter rate" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('payment_model') === 'fixed' && (
                    <FormField
                      control={form.control}
                      name="fixed_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fixed Amount</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('payment_model') === 'equity' && (
                    <FormField
                      control={form.control}
                      name="equity_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equity Percentage</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter percentage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between border-t p-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('templates')}
                  >
                    Back to Templates
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
