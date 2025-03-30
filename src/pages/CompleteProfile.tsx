import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: profile?.name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    company_name: profile?.company_name || '',
    company_description: profile?.company_description || '',
    industry: profile?.industry || '',
    company_size: profile?.company_size || '',
    founded: profile?.founded || '',
    website: profile?.website || '',
    stage: profile?.stage || '',
    project_needs: profile?.project_needs || [],
    skills: profile?.skills || [],
    portfolio_url: profile?.portfolio_url || '',
    resume_url: profile?.resume_url || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    availability: profile?.availability || '',
    interests: profile?.interests || [],
    experience_level: profile?.experience_level || '',
    preferred_categories: profile?.preferred_categories || [],
    college: profile?.college || '',
    graduation_year: profile?.graduation_year || '',
    major: profile?.major || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        company_name: profile.company_name || '',
        company_description: profile.company_description || '',
        industry: profile.industry || '',
        company_size: profile.company_size || '',
        founded: profile.founded || '',
        website: profile.website || '',
        stage: profile.stage || '',
        project_needs: profile.project_needs || [],
        skills: profile.skills || [],
        portfolio_url: profile.portfolio_url || '',
        resume_url: profile.resume_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        availability: profile.availability || '',
        interests: profile.interests || [],
        experience_level: profile.experience_level || '',
        preferred_categories: profile.preferred_categories || [],
        college: profile.college || '',
        graduation_year: profile.graduation_year || '',
        major: profile.major || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const profileData: Partial<Profile> = {
        id: user.id,
        name: formData.name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        // Startup specific fields
        company_name: formData.company_name,
        company_description: formData.company_description,
        industry: formData.industry,
        company_size: formData.company_size,
        founded: formData.founded || undefined,
        website: formData.website,
        stage: formData.stage,
        project_needs: formData.project_needs,
        // Student specific fields
        skills: formData.skills,
        portfolio_url: formData.portfolio_url,
        resume_url: formData.resume_url,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        availability: formData.availability,
        interests: formData.interests,
        experience_level: formData.experience_level,
        preferred_categories: formData.preferred_categories,
        college: formData.college,
        graduation_year: formData.graduation_year,
        major: formData.major,
      };

      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Tell us a bit about yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  placeholder="Write a short bio about yourself"
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  type="text"
                  id="avatar_url"
                  value={formData.avatar_url || ''}
                  onChange={handleChange}
                  placeholder="Enter a URL for your avatar"
                />
              </div>

              {profile?.role === 'startup' && (
                <>
                  <h2 className="text-xl font-semibold mt-4">Startup Information</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      type="text"
                      id="company_name"
                      value={formData.company_name || ''}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_description">Company Description</Label>
                    <Textarea
                      id="company_description"
                      value={formData.company_description || ''}
                      onChange={handleChange}
                      placeholder="Describe your company"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      type="text"
                      id="industry"
                      value={formData.industry || ''}
                      onChange={handleChange}
                      placeholder="Enter your industry"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Input
                      type="text"
                      id="company_size"
                      value={formData.company_size || ''}
                      onChange={handleChange}
                      placeholder="Enter your company size"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input
                      type="text"
                      id="founded"
                      value={formData.founded || ''}
                      onChange={handleChange}
                      placeholder="Enter the year your company was founded"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      type="text"
                      id="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      placeholder="Enter your company website URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Input
                      type="text"
                      id="stage"
                      value={formData.stage || ''}
                      onChange={handleChange}
                      placeholder="Enter your company stage"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project_needs">Project Needs</Label>
                    <Input
                      type="text"
                      id="project_needs"
                      value={formData.project_needs || ''}
                      onChange={handleChange}
                      placeholder="Enter your project needs"
                    />
                  </div>
                </>
              )}

              {profile?.role === 'student' && (
                <>
                  <h2 className="text-xl font-semibold mt-4">Student Information</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      type="text"
                      id="skills"
                      value={formData.skills || ''}
                      onChange={handleChange}
                      placeholder="Enter your skills"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="portfolio_url">Portfolio URL</Label>
                    <Input
                      type="text"
                      id="portfolio_url"
                      value={formData.portfolio_url || ''}
                      onChange={handleChange}
                      placeholder="Enter your portfolio URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resume_url">Resume URL</Label>
                    <Input
                      type="text"
                      id="resume_url"
                      value={formData.resume_url || ''}
                      onChange={handleChange}
                      placeholder="Enter your resume URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub URL</Label>
                    <Input
                      type="text"
                      id="github_url"
                      value={formData.github_url || ''}
                      onChange={handleChange}
                      placeholder="Enter your GitHub URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      type="text"
                      id="linkedin_url"
                      value={formData.linkedin_url || ''}
                      onChange={handleChange}
                      placeholder="Enter your LinkedIn URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      type="text"
                      id="availability"
                      value={formData.availability || ''}
                      onChange={handleChange}
                      placeholder="Enter your availability"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests</Label>
                    <Input
                      type="text"
                      id="interests"
                      value={formData.interests || ''}
                      onChange={handleChange}
                      placeholder="Enter your interests"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience_level">Experience Level</Label>
                    <Input
                      type="text"
                      id="experience_level"
                      value={formData.experience_level || ''}
                      onChange={handleChange}
                      placeholder="Enter your experience level"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preferred_categories">Preferred Categories</Label>
                    <Input
                      type="text"
                      id="preferred_categories"
                      value={formData.preferred_categories || ''}
                      onChange={handleChange}
                      placeholder="Enter your preferred categories"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Input
                      type="text"
                      id="college"
                      value={formData.college || ''}
                      onChange={handleChange}
                      placeholder="Enter your college"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Input
                      type="text"
                      id="graduation_year"
                      value={formData.graduation_year || ''}
                      onChange={handleChange}
                      placeholder="Enter your graduation year"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      type="text"
                      id="major"
                      value={formData.major || ''}
                      onChange={handleChange}
                      placeholder="Enter your major"
                    />
                  </div>
                </>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
