
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, Loader2 } from 'lucide-react';
import { Profile } from '@/types/database';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { MultiSelect } from '@/components/ui/multi-select';

// Define UserRole type to match with what's expected
type UserRole = 'student' | 'startup' | 'college_admin' | 'platform_admin';

// Skill options
const skillOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'node_js', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'product_management', label: 'Product Management' },
  { value: 'ui_design', label: 'UI Design' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'project_management', label: 'Project Management' },
];

// Interest options
const interestOptions = [
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_apps', label: 'Mobile Apps' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'iot', label: 'Internet of Things' },
  { value: 'ar_vr', label: 'AR/VR' },
  { value: 'saas', label: 'SaaS' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'sustainability', label: 'Sustainability' },
];

// Project needs options for startups
const projectNeedsOptions = [
  { value: 'market_research', label: 'Market Research' },
  { value: 'mvp_development', label: 'MVP Development' },
  { value: 'ui_ux_design', label: 'UI/UX Design' },
  { value: 'mobile_app', label: 'Mobile App Development' },
  { value: 'web_platform', label: 'Web Platform Development' },
  { value: 'data_analytics', label: 'Data Analytics' },
  { value: 'marketing_strategy', label: 'Marketing Strategy' },
  { value: 'gtm_strategy', label: 'Go-to-Market Strategy' },
  { value: 'branding', label: 'Branding & Identity' },
  { value: 'social_media', label: 'Social Media Strategy' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'seo_optimization', label: 'SEO Optimization' },
  { value: 'prototype_testing', label: 'Prototype Testing' },
  { value: 'business_plan', label: 'Business Plan Development' },
];

const CompleteProfile = () => {
  const { user, profile } = useAuth();
  const { userRole } = useAuthorization();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create form with react-hook-form
  const form = useForm({
    defaultValues: {
      role: userRole as UserRole || 'student',
      name: profile?.name || '',
      company_name: profile?.company_name || '',
      company_description: profile?.company_description || '',
      industry: profile?.industry || '',
      company_size: profile?.company_size || '',
      founded: profile?.founded || '',
      website: profile?.website || '',
      stage: profile?.stage || '',
      college: profile?.college || '',
      major: profile?.major || '',
      graduation_year: profile?.graduation_year || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      project_needs: profile?.project_needs || [],
    }
  });

  // Update form when profile or userRole changes
  useEffect(() => {
    if (profile) {
      form.reset({
        role: userRole as UserRole || profile.role,
        name: profile.name || '',
        company_name: profile.company_name || '',
        company_description: profile.company_description || '',
        industry: profile.industry || '',
        company_size: profile.company_size || '',
        founded: profile.founded || '',
        website: profile.website || '',
        stage: profile.stage || '',
        college: profile.college || '',
        major: profile.major || '',
        graduation_year: profile.graduation_year || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        project_needs: profile.project_needs || [],
      });
    }
  }, [profile, userRole]);

  // Handle form submission
  const onSubmit = async (data) => {
    console.log('Submitting form with data:', data);
    setIsSubmitting(true);

    try {
      // Make sure we have the required fields
      if (!user) {
        toast.error("You must be logged in to complete your profile");
        return;
      }

      // Make sure profile data includes id
      const completeProfileData = {
        ...data,
        id: user.id,
      };

      console.log('Prepared profile data for submission:', completeProfileData);

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(completeProfileData);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Success - redirect to dashboard
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error(`Failed to complete profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Common Fields - Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Role-specific fields */}
              {form.watch('role') === 'student' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="college"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College/University</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your college or university" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major/Field of Study</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="E.g., Computer Science, Business" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="graduation_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation Year</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="E.g., 2025" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={skillOptions}
                            placeholder="Select your skills"
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
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={interestOptions}
                            placeholder="Select your interests"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {form.watch('role') === 'startup' && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Briefly describe your company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="E.g., FinTech, Healthcare, EdTech" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="company_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-5">1-5 employees</SelectItem>
                              <SelectItem value="6-20">6-20 employees</SelectItem>
                              <SelectItem value="21-50">21-50 employees</SelectItem>
                              <SelectItem value="51-100">51-100 employees</SelectItem>
                              <SelectItem value="100+">100+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="founded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Year</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="E.g., 2022" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="idea">Idea Stage</SelectItem>
                            <SelectItem value="mvp">MVP</SelectItem>
                            <SelectItem value="pre_seed">Pre-Seed</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series_a">Series A</SelectItem>
                            <SelectItem value="series_b">Series B+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="project_needs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Needs</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={projectNeedsOptions}
                            placeholder="Select project needs"
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
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills Looking For</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={skillOptions}
                            placeholder="Select skills you're looking for"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfile;
