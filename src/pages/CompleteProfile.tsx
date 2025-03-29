
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Education, Profile } from '@/types/database';
import { toast } from 'sonner';

// Schema for student profile
const studentProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  bio: z.string().optional(),
  college: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  availability: z.enum(['full_time', 'part_time', 'internship', 'contract']).optional(),
  portfolio: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  resume: z.string().url().optional().or(z.literal('')),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startYear: z.number(),
    endYear: z.number().nullable(),
    current: z.boolean()
  })).optional()
});

// Schema for startup profile
const startupProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  companyName: z.string().min(1, { message: 'Company name is required' }),
  companyDescription: z.string().min(10, { message: 'Company description must be at least 10 characters' }),
  founded: z.number().min(1800).max(new Date().getFullYear()),
  industry: z.string().min(1, { message: 'Industry is required' }),
  website: z.string().url().optional().or(z.literal('')),
  companySize: z.string().optional(),
  stage: z.string().optional(),
  projectNeeds: z.string().optional()
});

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [educationEntries, setEducationEntries] = useState<Partial<Education>[]>([]);
  const [currentEducation, setCurrentEducation] = useState<Partial<Education>>({});

  const isStudent = profile?.role === 'student';
  const schema = isStudent ? studentProfileSchema : startupProfileSchema;

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name || '',
      bio: profile?.bio || '',
      college: profile?.college || '',
      major: profile?.major || '',
      graduationYear: profile?.graduationYear || '',
      experienceLevel: profile?.experienceLevel || 'beginner',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      availability: profile?.availability || 'part_time',
      portfolio: profile?.portfolio || '',
      github: profile?.github || '',
      linkedin: profile?.linkedin || '',
      resume: profile?.resume || '',
      education: profile?.education || [],
      companyName: profile?.companyName || '',
      companyDescription: profile?.companyDescription || '',
      founded: profile?.founded || new Date().getFullYear(),
      industry: profile?.industry || '',
      website: profile?.website || '',
      companySize: profile?.companySize || '',
      stage: profile?.stage || '',
      projectNeeds: profile?.projectNeeds || ''
    }
  });

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name);
      setValue('bio', profile.bio || '');
      setValue('college', profile.college || '');
      setValue('major', profile.major || '');
      setValue('graduationYear', profile.graduationYear || '');
      setValue('experienceLevel', profile.experienceLevel || 'beginner');
      setValue('skills', profile.skills || []);
      setValue('interests', profile.interests || []);
      setValue('availability', profile.availability || 'part_time');
      setValue('portfolio', profile.portfolio || '');
      setValue('github', profile.github || '');
      setValue('linkedin', profile.linkedin || '');
      setValue('resume', profile.resume || '');
      setValue('education', profile.education || []);
      setValue('companyName', profile.companyName || '');
      setValue('companyDescription', profile.companyDescription || '');
      setValue('founded', profile.founded || new Date().getFullYear());
      setValue('industry', profile.industry || '');
      setValue('website', profile.website || '');
      setValue('companySize', profile.companySize || '');
      setValue('stage', profile.stage || '');
      setValue('projectNeeds', profile.projectNeeds || '');

      // Set education entries for student profiles
      if (profile.role === 'student' && profile.education) {
        setEducationEntries(profile.education);
      }
    }
  }, [profile, setValue]);

  // Watch for values to use in the UI
  const watchedSkills = watch('skills', []);
  const watchedInterests = watch('interests', []);

  // Add a new skill
  const addSkill = () => {
    if (newSkill.trim() && !watchedSkills.includes(newSkill.trim())) {
      setValue('skills', [...watchedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    setValue('skills', watchedSkills.filter(skill => skill !== skillToRemove));
  };

  // Add a new interest
  const addInterest = () => {
    if (newInterest.trim() && !watchedInterests.includes(newInterest.trim())) {
      setValue('interests', [...watchedInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  // Remove an interest
  const removeInterest = (interestToRemove: string) => {
    setValue('interests', watchedInterests.filter(interest => interest !== interestToRemove));
  };

  // Add education entry
  const addEducation = () => {
    if (
      currentEducation.institution && 
      currentEducation.degree && 
      currentEducation.field && 
      currentEducation.startYear
    ) {
      const newEntry: Education = {
        institution: currentEducation.institution,
        degree: currentEducation.degree,
        field: currentEducation.field,
        startYear: Number(currentEducation.startYear),
        endYear: currentEducation.current ? null : Number(currentEducation.endYear || 0),
        current: Boolean(currentEducation.current)
      };
      
      const updatedEntries = [...educationEntries, newEntry];
      setEducationEntries(updatedEntries);
      setValue('education', updatedEntries as Education[]);
      
      // Reset form
      setCurrentEducation({});
    } else {
      toast.error('Please fill all required education fields');
    }
  };

  // Remove education entry
  const removeEducation = (index: number) => {
    const updatedEntries = educationEntries.filter((_, i) => i !== index);
    setEducationEntries(updatedEntries);
    setValue('education', updatedEntries as Education[]);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      // Create profile data based on role
      const profileData: Partial<Profile> = isStudent ? {
        name: data.name,
        bio: data.bio,
        college: data.college,
        major: data.major,
        graduationYear: data.graduationYear,
        experienceLevel: data.experienceLevel,
        skills: data.skills,
        interests: data.interests,
        availability: data.availability,
        portfolio: data.portfolio,
        github: data.github,
        linkedin: data.linkedin,
        resume: data.resume,
        education: data.education as Education[]
      } : {
        name: data.name,
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        founded: data.founded,
        industry: data.industry,
        website: data.website,
        companySize: data.companySize,
        stage: data.stage,
        projectNeeds: data.projectNeeds
      };

      await updateProfile(profileData);
      
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return <div className="container mx-auto py-8">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            {isStudent 
              ? 'Add information about your skills and experience to match with the right opportunities.' 
              : 'Add information about your company to attract the right talent.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Common fields for both roles */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input id="name" {...field} />
                    )}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                
                {isStudent ? (
                  <div className="space-y-2">
                    <Label htmlFor="college">College/University</Label>
                    <Controller
                      name="college"
                      control={control}
                      render={({ field }) => (
                        <Input id="college" {...field} />
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Controller
                      name="companyName"
                      control={control}
                      render={({ field }) => (
                        <Input id="companyName" {...field} />
                      )}
                    />
                    {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
                  </div>
                )}
              </div>
              
              {/* Role-specific fields */}
              {isStudent ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="major">Major/Field of Study</Label>
                      <Controller
                        name="major"
                        control={control}
                        render={({ field }) => (
                          <Input id="major" {...field} />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Controller
                        name="graduationYear"
                        control={control}
                        render={({ field }) => (
                          <Input id="graduationYear" type="text" {...field} />
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Controller
                      name="experienceLevel"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={(value: string) => field.onChange(value)} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Controller
                      name="availability"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={(value: string) => field.onChange(value)} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full-time</SelectItem>
                            <SelectItem value="part_time">Part-time</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          id="bio" 
                          placeholder="Tell us a bit about yourself" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      )}
                    />
                  </div>
                  
                  {/* Skills section */}
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add a skill" 
                        value={newSkill} 
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interests section */}
                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add an interest" 
                        value={newInterest} 
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                      />
                      <Button type="button" onClick={addInterest}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedInterests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {interest}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Education section */}
                  <div className="space-y-4">
                    <Label>Education</Label>
                    
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution</Label>
                          <Input 
                            id="institution" 
                            value={currentEducation.institution || ''} 
                            onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="degree">Degree</Label>
                          <Input 
                            id="degree" 
                            value={currentEducation.degree || ''} 
                            onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="field">Field of Study</Label>
                        <Input 
                          id="field" 
                          value={currentEducation.field || ''} 
                          onChange={(e) => setCurrentEducation({...currentEducation, field: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startYear">Start Year</Label>
                          <Input 
                            id="startYear" 
                            type="number" 
                            value={currentEducation.startYear || ''} 
                            onChange={(e) => setCurrentEducation({...currentEducation, startYear: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endYear">End Year</Label>
                          <Input 
                            id="endYear" 
                            type="number" 
                            value={currentEducation.endYear || ''} 
                            onChange={(e) => setCurrentEducation({...currentEducation, endYear: parseInt(e.target.value)})}
                            disabled={currentEducation.current}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="current"
                          checked={currentEducation.current || false}
                          onChange={(e) => setCurrentEducation({...currentEducation, current: e.target.checked})}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="current" className="text-sm font-normal">Currently studying here</Label>
                      </div>
                      
                      <Button type="button" onClick={addEducation} className="w-full">
                        Add Education Entry
                      </Button>
                    </div>
                    
                    {/* Education entries list */}
                    {educationEntries.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h3 className="font-medium">Education History</h3>
                        {educationEntries.map((edu, index) => (
                          <div key={index} className="border rounded-md p-3 flex justify-between">
                            <div>
                              <p className="font-medium">{edu.institution}</p>
                              <p className="text-sm">{edu.degree} in {edu.field}</p>
                              <p className="text-sm text-gray-500">
                                {edu.startYear} - {edu.current ? 'Present' : edu.endYear}
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* URLs section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio URL</Label>
                      <Controller
                        name="portfolio"
                        control={control}
                        render={({ field }) => (
                          <Input id="portfolio" {...field} />
                        )}
                      />
                      {errors.portfolio && <p className="text-sm text-red-500">{errors.portfolio.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub URL</Label>
                      <Controller
                        name="github"
                        control={control}
                        render={({ field }) => (
                          <Input id="github" {...field} />
                        )}
                      />
                      {errors.github && <p className="text-sm text-red-500">{errors.github.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Controller
                        name="linkedin"
                        control={control}
                        render={({ field }) => (
                          <Input id="linkedin" {...field} />
                        )}
                      />
                      {errors.linkedin && <p className="text-sm text-red-500">{errors.linkedin.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resume">Resume URL</Label>
                      <Controller
                        name="resume"
                        control={control}
                        render={({ field }) => (
                          <Input id="resume" {...field} />
                        )}
                      />
                      {errors.resume && <p className="text-sm text-red-500">{errors.resume.message}</p>}
                    </div>
                  </div>
                </>
              ) : (
                /* Startup-specific fields */
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Company Description</Label>
                    <Controller
                      name="companyDescription"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          id="companyDescription" 
                          placeholder="Tell us about your company" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      )}
                    />
                    {errors.companyDescription && <p className="text-sm text-red-500">{errors.companyDescription.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                          <Input id="industry" {...field} />
                        )}
                      />
                      {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="founded">Founded Year</Label>
                      <Controller
                        name="founded"
                        control={control}
                        render={({ field }) => (
                          <Input id="founded" type="number" {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        )}
                      />
                      {errors.founded && <p className="text-sm text-red-500">{errors.founded.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Company Website</Label>
                      <Controller
                        name="website"
                        control={control}
                        render={({ field }) => (
                          <Input id="website" {...field} />
                        )}
                      />
                      {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Controller
                        name="companySize"
                        control={control}
                        render={({ field }) => (
                          <Input id="companySize" {...field} />
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Company Stage</Label>
                    <Controller
                      name="stage"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={(value: string) => field.onChange(value)} 
                          defaultValue={field.value || ''}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select company stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea Stage</SelectItem>
                            <SelectItem value="mvp">MVP</SelectItem>
                            <SelectItem value="pre_seed">Pre-Seed</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series_a">Series A</SelectItem>
                            <SelectItem value="series_b">Series B+</SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectNeeds">Project Needs</Label>
                    <Controller
                      name="projectNeeds"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          id="projectNeeds" 
                          placeholder="What kind of projects are you looking for?" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      )}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
