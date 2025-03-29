import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageIcon, FileIcon, GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Profile } from '@/types/database';

// Define form schemas
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().optional(),
  college: z.string().optional(),
  major: z.string().optional(),
  graduation_year: z.string().optional(),
  experience_level: z.string().optional(),
  skills: z.string().array().optional(),
  interests: z.string().array().optional(),
  availability: z.string().optional(),
  portfolio_url: z.string().optional(),
  github_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  resume_url: z.string().optional(),
});

const startupProfileFormSchema = z.object({
  company_name: z.string().optional(),
  company_description: z.string().optional(),
  industry: z.string().optional(),
  founded: z.string().optional(),
  company_size: z.string().optional(),
  website: z.string().optional(),
  project_needs: z.string().array().optional(),
});

// Define form types
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type StartupProfileFormValues = z.infer<typeof startupProfileFormSchema>;

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  
  // Initialize form for student profile
  const { reset, ...studentForm } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      college: '',
      major: '',
      graduation_year: '',
      experience_level: '',
      skills: [],
      interests: [],
      availability: '',
      portfolio_url: '',
      github_url: '',
      linkedin_url: '',
      resume_url: '',
    },
  });
  
  // Initialize form for startup profile
  const { reset: startupReset, ...startupForm } = useForm<StartupProfileFormValues>({
    resolver: zodResolver(startupProfileFormSchema),
    defaultValues: {
      company_name: '',
      company_description: '',
      industry: '',
      founded: '',
      company_size: '',
      website: '',
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
  const onStudentSubmit = async (data: ProfileFormValues) => {
    try {
      setSubmitting(true);
      
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
      });
      
      toast.success("Profile updated successfully!");
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
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating startup profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!profile) {
    return <div>Loading...</div>;
  }
  
  // Update Avatar section
  const renderAvatarSection = () => (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 overflow-hidden rounded-full">
          <img 
            src={profile?.avatar_url || 'https://via.placeholder.com/150'} 
            alt={profile?.name || 'User'} 
            className="object-cover w-full h-full"
          />
          <button 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity"
            onClick={() => setIsAvatarDialogOpen(true)}
          >
            Change
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile?.name}</h2>
          <p className="text-muted-foreground">{profile?.role === 'student' ? 'Student' : 'Startup'}</p>
        </div>
      </div>
    </div>
  );
  
  // Render Student Profile Form
  const renderStudentProfileForm = () => (
    <Form {...studentForm}>
      <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
        <FormField
          control={studentForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
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
                <Textarea placeholder="Tell us about yourself" {...field} />
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
                <Input placeholder="Your college" {...field} />
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
                <Input placeholder="Your major" {...field} />
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
                <Input placeholder="Your graduation year" {...field} />
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
                <Input placeholder="Your skills (comma separated)" {...field} />
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
                <Input placeholder="Your interests (comma separated)" {...field} />
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
              <FormControl>
                <Input placeholder="Your availability" {...field} />
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
                <Input placeholder="Your portfolio URL" {...field} />
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
                <Input placeholder="Your GitHub URL" {...field} />
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
                <Input placeholder="Your LinkedIn URL" {...field} />
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
                <Input placeholder="Your resume URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
  
  // Render Startup Profile Form
  const renderStartupProfileForm = () => (
    <Form {...startupForm}>
      <form onSubmit={startupForm.handleSubmit(onStartupSubmit)} className="space-y-4">
        <FormField
          control={startupForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="Contact name" {...field} />
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
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about yourself" {...field} />
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
                <Input placeholder="Company name" {...field} />
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
                <Textarea placeholder="Company description" {...field} />
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
                <Input placeholder="Industry" {...field} />
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
                <Input placeholder="Founded year" {...field} />
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
              <FormControl>
                <Input placeholder="Company size" {...field} />
              </FormControl>
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
                <Input placeholder="Website URL" {...field} />
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
                <Input placeholder="Project needs (comma separated)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );

  // GitHub, LinkedIn, Resume links rendering
  const renderExternalLinks = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">External Links</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitHubLogoIcon className="w-5 h-5" />
            <span>GitHub</span>
          </div>
          <a 
            href={profile?.github_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {profile?.github_url ? 'View Profile' : 'Not linked'}
          </a>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkedInLogoIcon className="w-5 h-5" />
            <span>LinkedIn</span>
          </div>
          <a 
            href={profile?.linkedin_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {profile?.linkedin_url ? 'View Profile' : 'Not linked'}
          </a>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="w-5 h-5" />
            <span>Resume</span>
          </div>
          <a 
            href={profile?.resume_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {profile?.resume_url ? 'View Resume' : 'Not uploaded'}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information to connect with other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {renderAvatarSection()}
          {profile?.role === 'student' ? renderStudentProfileForm() : renderStartupProfileForm()}
          {renderExternalLinks()}
        </CardContent>
      </Card>
      
      {/* Avatar Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
            <DialogDescription>
              Upload a new avatar for your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input type="file" />
          </div>
          <DialogFooter>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
