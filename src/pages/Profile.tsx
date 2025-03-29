import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useWatch } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Linkedin, FileText, ExternalLink, Mail, Building, Briefcase, GraduationCap, Calendar } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import type { Profile as ProfileType } from '@/types/database'; 

// Define the form schema based on profile type
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  company_name: z.string().optional(),
  company_description: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  founded: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  stage: z.string().optional(),
  college: z.string().optional(),
  major: z.string().optional(),
  graduation_year: z.string().optional(),
  github_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  linkedin_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  portfolio_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  resume_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Form watcher component to trigger re-renders when form values change
const FormWatch = ({ children, control }) => {
  useWatch({
    control
  });
  return children;
};

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Set default values based on profile type
  const defaultValues: ProfileFormValues = {
    name: profile?.name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    company_name: profile?.company_name || '',
    company_description: profile?.company_description || '',
    industry: profile?.industry || '',
    company_size: profile?.company_size || '',
    founded: profile?.founded ? String(profile.founded) : '',
    website: profile?.website || '',
    stage: profile?.stage || '',
    college: profile?.college || '',
    major: profile?.major || '',
    graduation_year: profile?.graduation_year || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    portfolio_url: profile?.portfolio_url || '',
    resume_url: profile?.resume_url || '',
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        company_name: profile.company_name || '',
        company_description: profile.company_description || '',
        industry: profile.industry || '',
        company_size: profile.company_size || '',
        founded: profile.founded ? String(profile.founded) : '',
        website: profile.website || '',
        stage: profile.stage || '',
        college: profile.college || '',
        major: profile.major || '',
        graduation_year: profile.graduation_year || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
        resume_url: profile.resume_url || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      // Handle file uploads first
      let avatarUrl = profile?.avatar_url || '';
      let resumeUrl = profile?.resume_url || '';
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrl;
      }
      
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}-resume-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile, { upsert: true });
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
          
        resumeUrl = publicUrl;
      }
      
      // Update profile
      const { error } = await supabase.from('profiles').update({
        name: values.name,
        bio: values.bio,
        avatar_url: avatarUrl,
        company_name: values.company_name,
        company_description: values.company_description,
        industry: values.industry,
        company_size: values.company_size,
        founded: values.founded ? String(values.founded) : null,
        website: values.website,
        stage: values.stage,
        college: values.college,
        major: values.major,
        graduation_year: values.graduation_year,
        github_url: values.github_url,
        linkedin_url: values.linkedin_url,
        portfolio_url: values.portfolio_url,
        resume_url: resumeUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.avatar_url || ""} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                    <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-center">{profile?.name}</CardTitle>
                  <CardDescription className="text-center">
                    {profile?.role === "startup" ? "Startup" : "Student"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile?.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {profile?.role === "startup" ? (
                    <div className="space-y-3">
                      {profile?.company_name && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.company_name}</span>
                        </div>
                      )}
                      
                      {profile?.industry && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.industry}</span>
                        </div>
                      )}
                      
                      {profile?.founded && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Founded: {profile.founded}</span>
                        </div>
                      )}
                      
                      {profile?.website && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profile?.college && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.college}</span>
                        </div>
                      )}
                      
                      {profile?.major && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.major}</span>
                        </div>
                      )}
                      
                      {profile?.skills && profile.skills.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Links</span>
                        <div className="flex items-center gap-2">
                          {profile?.github_url && (
                            <a
                              href={profile.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                          
                          {profile?.linkedin_url && (
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          
                          {profile?.portfolio_url && (
                            <a
                              href={profile.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          
                          {profile?.resume_url && (
                            <a
                              href={profile.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Edit Profile Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Basic Info</TabsTrigger>
                    {profile?.role === "startup" ? (
                      <TabsTrigger value="company">Company Details</TabsTrigger>
                    ) : (
                      <TabsTrigger value="education">Education & Skills</TabsTrigger>
                    )}
                    <TabsTrigger value="links">Links & Social</TabsTrigger>
                  </TabsList>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <FormWatch control={form.control}>
                        <TabsContent value="profile" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <FileUpload
                                label="Profile Picture"
                                accept="image/*"
                                onFileSelected={setAvatarFile}
                                value={profile?.avatar_url}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="md:col-span-2">
                              <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Tell us about yourself"
                                        className="resize-none min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        {profile?.role === "startup" ? (
                          <TabsContent value="company" className="space-y-4">
                            <FormField
                              control={form.control}
                              name="company_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your company name" {...field} />
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
                                    <Textarea
                                      placeholder="Describe your company"
                                      className="resize-none min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Industry</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="company_size"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company Size</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="1-10">1-10 employees</SelectItem>
                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                        <SelectItem value="201-500">201-500 employees</SelectItem>
                                        <SelectItem value="501+">501+ employees</SelectItem>
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
                                      <Input type="number" placeholder="e.g. 2020" {...field} />
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
                                    <FormLabel>Company Stage</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select stage" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="idea">Idea Stage</SelectItem>
                                        <SelectItem value="mvp">MVP</SelectItem>
                                        <SelectItem value="pre_seed">Pre-Seed</SelectItem>
                                        <SelectItem value="seed">Seed</SelectItem>
                                        <SelectItem value="series_a">Series A</SelectItem>
                                        <SelectItem value="series_b_plus">Series B+</SelectItem>
                                        <SelectItem value="profitable">Profitable</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>
                        ) : (
                          <TabsContent value="education" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="college"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>College/University</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your college or university" {...field} />
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
                                      <Input placeholder="Your major" {...field} />
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
                                      <Input placeholder="e.g. 2024" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div>
                              <FileUpload
                                label="Resume/CV"
                                accept=".pdf,.doc,.docx"
                                onFileSelected={setResumeFile}
                                value={profile?.resume_url}
                              />
                              <FormDescription>
                                Upload your resume or CV (PDF, DOC, or DOCX)
                              </FormDescription>
                            </div>
                          </TabsContent>
                        )}
                        
                        <TabsContent value="links" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://yourwebsite.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="github_url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GitHub</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://github.com/yourusername" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="linkedin_url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://linkedin.com/in/yourusername" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="portfolio_url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Portfolio</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourportfolio.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      </FormWatch>
                      
                      <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
