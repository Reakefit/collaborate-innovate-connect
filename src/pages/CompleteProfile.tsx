import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Profile, Education } from '@/types/database';

// Define form schemas
const studentProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  college: z.string().min(2, { message: "College must be at least 2 characters" }),
  major: z.string().min(2, { message: "Major must be at least 2 characters" }),
  graduation_year: z.string().min(4, { message: "Graduation year must be 4 characters" }),
  experience_level: z.string().min(2, { message: "Experience level is required" }),
  skills: z.string().array().min(1, { message: "At least one skill is required" }),
  interests: z.string().array(),
  availability: z.string().min(2, { message: "Availability is required" }),
  bio: z.string().max(160, { message: "Bio must be less than 160 characters" }),
  portfolio_url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  github_url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  linkedin_url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  resume_url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startYear: z.number(),
      endYear: z.number().optional(),
      current: z.boolean().optional(),
    })
  ).optional(),
});

const startupProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().max(160, { message: "Bio must be less than 160 characters" }),
  company_name: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  company_description: z.string().min(10, { message: "Company description must be at least 10 characters" }),
  industry: z.string().min(2, { message: "Industry must be at least 2 characters" }),
  founded: z.string().min(4, { message: "Founded year must be 4 characters" }),
  company_size: z.string().min(2, { message: "Company size is required" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional(),
  project_needs: z.string().array(),
});

// Define form types
type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;
type StartupProfileFormValues = z.infer<typeof startupProfileSchema>;

const CompleteProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  // Form hooks
  const { reset, ...studentForm } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: "",
      college: "",
      major: "",
      graduation_year: "",
      experience_level: "",
      skills: [],
      interests: [],
      availability: "",
      bio: "",
      portfolio_url: "",
      github_url: "",
      linkedin_url: "",
      resume_url: "",
      education: [],
    },
  });

  const { reset: startupReset, ...startupForm } = useForm<StartupProfileFormValues>({
    resolver: zodResolver(startupProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      company_name: "",
      company_description: "",
      industry: "",
      founded: "",
      company_size: "",
      website: "",
      project_needs: [],
    },
  });

  // Update loading profile data into form
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        college: profile.college || '',
        major: profile.major || '',
        graduation_year: profile.graduation_year || '',
        experience_level: profile.experience_level || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        availability: profile.availability || '',
        bio: profile.bio || '',
        portfolio_url: profile.portfolio_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        resume_url: profile.resume_url || '',
        education: profile.education || [],
      });
      
      if (profile.role === 'startup') {
        startupReset({
          company_name: profile.company_name || '',
          company_description: profile.company_description || '',
          industry: profile.industry || '',
          founded: profile.founded || '',
          company_size: profile.company_size || '',
          website: profile.website || '',
          project_needs: profile.project_needs || [],
        });
      }
    }
  }, [profile, reset, startupReset]);

  // Form submission handlers
  const onStudentSubmit = async (data: StudentProfileFormValues) => {
    try {
      setSubmitting(true);
      
      // Convert education array to proper format if needed
      const education = data.education || [];
      
      await updateProfile({
        name: data.name,
        bio: data.bio,
        college: data.college,
        major: data.major,
        graduation_year: data.graduation_year,
        experience_level: data.experience_level,
        skills: data.skills,
        interests: data.interests,
        availability: data.availability,
        portfolio_url: data.portfolio_url,
        github_url: data.github_url,
        linkedin_url: data.linkedin_url,
        resume_url: data.resume_url,
        education
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const onStartupSubmit = async (data: StartupProfileFormValues) => {
    try {
      setSubmitting(true);
      
      await updateProfile({
        name: data.name,
        bio: data.bio,
        company_name: data.company_name,
        company_description: data.company_description,
        industry: data.industry,
        founded: data.founded,
        company_size: data.company_size,
        website: data.website,
        project_needs: data.project_needs
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error updating startup profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !profile) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const renderStudentForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
        <CardDescription>Complete your profile to connect with startups.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...studentForm}>
          <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
            <FormField
              control={studentForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College</FormLabel>
                  <FormControl>
                    <Input placeholder="University Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Major</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="graduation_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Year</FormLabel>
                  <FormControl>
                    <Input placeholder="2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="experience_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { value: "javascript", label: "JavaScript" },
                        { value: "typescript", label: "TypeScript" },
                        { value: "react", label: "React" },
                        { value: "node", label: "Node.js" },
                        { value: "python", label: "Python" },
                        { value: "java", label: "Java" },
                        { value: "c++", label: "C++" },
                        { value: "c#", label: "C#" },
                        { value: "html", label: "HTML" },
                        { value: "css", label: "CSS" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { value: "web_development", label: "Web Development" },
                        { value: "mobile_development", label: "Mobile Development" },
                        { value: "data_science", label: "Data Science" },
                        { value: "machine_learning", label: "Machine Learning" },
                        { value: "ui_ux_design", label: "UI/UX Design" },
                        { value: "devops", label: "DevOps" },
                        { value: "cybersecurity", label: "Cybersecurity" },
                        { value: "blockchain", label: "Blockchain" },
                        { value: "other", label: "Other" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short bio about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="portfolio_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="github_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={studentForm.control}
              name="resume_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/resume.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderStartupForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Startup Profile</CardTitle>
        <CardDescription>Complete your profile to find talented students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...startupForm}>
          <form onSubmit={startupForm.handleSubmit(onStartupSubmit)} className="space-y-4">
            <FormField
              control={startupForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short bio about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="company_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short description about your company"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="founded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founded Year</FormLabel>
                  <FormControl>
                    <Input placeholder="2010" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
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
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={startupForm.control}
              name="project_needs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Needs</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { value: "web_development", label: "Web Development" },
                        { value: "mobile_development", label: "Mobile Development" },
                        { value: "data_science", label: "Data Science" },
                        { value: "machine_learning", label: "Machine Learning" },
                        { value: "ui_ux_design", label: "UI/UX Design" },
                        { value: "devops", label: "DevOps" },
                        { value: "cybersecurity", label: "Cybersecurity" },
                        { value: "blockchain", label: "Blockchain" },
                        { value: "other", label: "Other" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center">
        <div className="w-full md:w-3/4 lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                {profile.role === 'student'
                  ? 'Fill out your student profile to connect with exciting projects.'
                  : 'Fill out your startup profile to find talented students for your projects.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.role === 'student' ? renderStudentForm() : renderStartupForm()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
