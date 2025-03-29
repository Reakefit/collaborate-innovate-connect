
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MultiSelect } from '@/components/ui/multi-select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Check, FileEdit, Github, Linkedin, Mail, MapPin, Upload, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/FileUpload';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Import as a type-only import to avoid conflict
import type { Profile as ProfileType } from '@/types/database';
import { Education } from '@/types/database';

// Define the form values type
interface ProfileFormValues {
  name?: string;
  bio?: string;
  availability?: 'full_time' | 'part_time' | 'internship' | 'contract';
  skills?: string[];
  interests?: string[];
  college?: string;
  major?: string;
  graduation_year?: string;
  experience_level?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  education?: Education[];
}

interface StartupProfileFormValues {
  company_name?: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  founded?: string;
  website?: string;
  project_needs?: string[];
}

function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  // Form for student profile
  const studentForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: profile?.name || '',
      bio: profile?.bio || '',
      college: profile?.college || '',
      major: profile?.major || '',
      graduation_year: profile?.graduation_year || '',
      experience_level: profile?.experience_level || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      availability: profile?.availability as any || 'part_time',
      github_url: profile?.github_url || '',
      linkedin_url: profile?.linkedin_url || '',
      portfolio_url: profile?.portfolio_url || '',
      resume_url: profile?.resume_url || '',
      education: profile?.education || [],
    }
  });

  // Form for startup profile
  const startupForm = useForm<StartupProfileFormValues>({
    defaultValues: {
      company_name: profile?.company_name || '',
      company_description: profile?.company_description || '',
      industry: profile?.industry || '',
      company_size: profile?.company_size || '',
      founded: profile?.founded ? String(profile.founded) : '',
      website: profile?.website || '',
      project_needs: profile?.project_needs || [],
    }
  });

  useEffect(() => {
    if (profile) {
      // Reset forms when profile data changes
      studentForm.reset({
        name: profile.name,
        bio: profile.bio,
        college: profile.college,
        major: profile.major,
        graduation_year: profile.graduation_year,
        experience_level: profile.experience_level,
        skills: profile.skills || [],
        interests: profile.interests || [],
        availability: profile.availability as any,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        portfolio_url: profile.portfolio_url,
        resume_url: profile.resume_url,
        education: profile.education || [],
      });

      startupForm.reset({
        company_name: profile.company_name,
        company_description: profile.company_description,
        industry: profile.industry,
        company_size: profile.company_size,
        founded: profile.founded ? String(profile.founded) : '',
        website: profile.website,
        project_needs: profile.project_needs || [],
      });

      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const onStudentSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Convert founded to a number if it exists
      const parsedData: Partial<ProfileType> = {
        ...data,
        // Ensure other fields match the expected types
        founded: data.founded ? parseInt(data.founded as string) : undefined,
      };
      
      await updateProfile(parsedData);
      setIsEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onStartupSubmit = async (data: StartupProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Convert founded to a number if it exists
      const parsedData: Partial<ProfileType> = {
        ...data,
        // Add name and bio from profile since they're not in the startup form
        name: profile?.name,
        bio: profile?.bio,
        // Convert founded to a number if it exists
        founded: data.founded ? parseInt(data.founded) : undefined,
      };
      
      await updateProfile(parsedData);
      setIsEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      if (!user) throw new Error('No user');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const avatar_url = urlData.publicUrl;
      
      await updateProfile({ avatar_url });
      setAvatarUrl(avatar_url);
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    uploadAvatar(file);
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading profile...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile data.</p>
        </div>
      </div>
    );
  }

  // Skills options
  const skillOptions = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'node', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'ui_design', label: 'UI Design' },
    { value: 'ux_design', label: 'UX Design' },
    { value: 'product_management', label: 'Product Management' },
    { value: 'machine_learning', label: 'Machine Learning' },
    { value: 'data_science', label: 'Data Science' },
    { value: 'devops', label: 'DevOps' },
    { value: 'cloud', label: 'Cloud Infrastructure' },
  ];

  // Render student form
  const renderStudentForm = () => (
    <Form {...studentForm}>
      <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={studentForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} disabled={!isEditMode} />
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
                <Select 
                  disabled={!isEditMode} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
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
        </div>
        
        <FormField
          control={studentForm.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself" 
                  className="resize-none min-h-32" 
                  disabled={!isEditMode}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={studentForm.control}
            name="college"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College/University</FormLabel>
                <FormControl>
                  <Input placeholder="Your educational institution" {...field} disabled={!isEditMode} />
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
                <FormLabel>Major/Degree</FormLabel>
                <FormControl>
                  <Input placeholder="Your field of study" {...field} disabled={!isEditMode} />
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
                  <Input placeholder="Expected graduation year" {...field} disabled={!isEditMode} />
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
                <Select 
                  disabled={!isEditMode} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={studentForm.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <MultiSelect
                  options={skillOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select skills"
                  className={!isEditMode ? "pointer-events-none opacity-70" : ""}
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
                  options={skillOptions} // Reusing the same options for simplicity
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select interests"
                  className={!isEditMode ? "pointer-events-none opacity-70" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isEditMode && (
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );

  // Render startup form
  const renderStartupForm = () => (
    <Form {...startupForm}>
      <form onSubmit={startupForm.handleSubmit(onStartupSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={startupForm.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your company name" {...field} disabled={!isEditMode} />
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
                  <Input placeholder="Your company's industry" {...field} disabled={!isEditMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={startupForm.control}
          name="company_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your company" 
                  className="resize-none min-h-32" 
                  disabled={!isEditMode}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={startupForm.control}
            name="company_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <Select 
                  disabled={!isEditMode} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
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
            control={startupForm.control}
            name="founded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Founded Year</FormLabel>
                <FormControl>
                  <Input placeholder="Year your company was founded" {...field} disabled={!isEditMode} />
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
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="Your company website" {...field} disabled={!isEditMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={startupForm.control}
          name="project_needs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Needs</FormLabel>
              <FormControl>
                <MultiSelect
                  options={skillOptions} // Reusing the same options for simplicity
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select project needs"
                  className={!isEditMode ? "pointer-events-none opacity-70" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isEditMode && (
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              {isEditMode && (
                <div className="absolute -bottom-2 -right-2">
                  <label 
                    htmlFor="avatar-upload" 
                    className="rounded-full bg-primary p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-primary-foreground" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4 text-center md:text-left">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.role === 'student' ? 'Student' : 'Startup'}</p>
              </div>
              
              {profile.role === 'student' ? (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.skills?.slice(0, 5).map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-medium">{profile.company_name || 'Company Name'}</p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="inline-flex gap-2"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <X className="h-4 w-4" /> Cancel Editing
                  </>
                ) : (
                  <>
                    <FileEdit className="h-4 w-4" /> Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={profile.role === 'student' ? 'student' : 'startup'} className="w-full">
                <TabsList className="w-full">
                  {profile.role === 'student' ? (
                    <TabsTrigger value="student" className="flex-1">Student Profile</TabsTrigger>
                  ) : (
                    <TabsTrigger value="startup" className="flex-1">Startup Profile</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="student" className="pt-6">
                  {renderStudentForm()}
                </TabsContent>
                
                <TabsContent value="startup" className="pt-6">
                  {renderStartupForm()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="w-full mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                
                {profile.github_url && (
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GitHub Profile
                    </a>
                  </div>
                )}
                
                {profile.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                
                {profile.resume_url && (
                  <div className="flex items-center gap-3">
                    <FileEdit className="h-5 w-5 text-muted-foreground" />
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Resume
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {profile.role === 'student' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests?.map((interest, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary-foreground">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {profile.role === 'startup' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Project Needs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.project_needs?.map((need, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {need}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
