
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
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    bio: '',
    company_name: '',
    company_description: '',
    industry: '',
    company_size: '',
    founded: '',
    website: '',
    stage: '',
    project_needs: [],
    skills: [],
    portfolio_url: '',
    resume_url: '',
    github_url: '',
    linkedin_url: '',
    availability: '',
    interests: [],
    experience_level: '',
    preferred_categories: [],
    college: '',
    graduation_year: '',
    major: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
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

    // Handle array fields
    if (id === 'skills' || id === 'interests' || id === 'preferred_categories' || id === 'project_needs') {
      const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, [id]: arrayValue }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Only include fields relevant to the user role
      const isStartup = user.user_metadata?.role === 'startup';

      // Create a base profile object
      const profileData: Record<string, any> = {
        id: user.id,
        name: formData.name,
        bio: formData.bio,
        role: user.user_metadata?.role || 'student',
      };

      // Add startup-specific fields
      if (isStartup) {
        profileData.company_name = formData.company_name;
        profileData.company_description = formData.company_description;
        profileData.industry = formData.industry;
        profileData.company_size = formData.company_size;
        profileData.founded = formData.founded ? formData.founded : null;
        profileData.website = formData.website;
        profileData.stage = formData.stage;
        profileData.project_needs = formData.project_needs;
      } 
      // Add student-specific fields
      else {
        profileData.skills = formData.skills;
        profileData.portfolio_url = formData.portfolio_url;
        profileData.resume_url = formData.resume_url;
        profileData.github_url = formData.github_url;
        profileData.linkedin_url = formData.linkedin_url;
        profileData.availability = formData.availability;
        profileData.interests = formData.interests;
        profileData.experience_level = formData.experience_level;
        profileData.preferred_categories = formData.preferred_categories;
        profileData.college = formData.college;
        profileData.graduation_year = formData.graduation_year;
        profileData.major = formData.major;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      // Update local profile state
      await updateProfile(profileData);
      
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStartupFields = () => (
    <>
      <h2 className="text-xl font-semibold mt-4">Startup Information</h2>
      
      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name*</Label>
        <Input
          type="text"
          id="company_name"
          value={formData.company_name || ''}
          onChange={handleChange}
          placeholder="Enter your company name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company_description">Company Description*</Label>
        <Textarea
          id="company_description"
          value={formData.company_description || ''}
          onChange={handleChange}
          placeholder="Describe your company"
          className="min-h-[80px]"
          required
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
          placeholder="Enter your company size (e.g., 1-10, 11-50)"
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
        <Label htmlFor="stage">Company Stage</Label>
        <Input
          type="text"
          id="stage"
          value={formData.stage || ''}
          onChange={handleChange}
          placeholder="E.g., Seed, Series A, Growth"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="project_needs">Project Needs (comma separated)</Label>
        <Input
          type="text"
          id="project_needs"
          value={Array.isArray(formData.project_needs) ? formData.project_needs.join(', ') : ''}
          onChange={handleChange}
          placeholder="E.g., Web Development, Mobile App, UI/UX"
        />
      </div>
    </>
  );

  const renderStudentFields = () => (
    <>
      <h2 className="text-xl font-semibold mt-4">Student Information</h2>
      
      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)*</Label>
        <Input
          type="text"
          id="skills"
          value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
          onChange={handleChange}
          placeholder="E.g., React, Node.js, UI Design"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="college">College/University*</Label>
        <Input
          type="text"
          id="college"
          value={formData.college || ''}
          onChange={handleChange}
          placeholder="Enter your college or university"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="major">Major/Field of Study</Label>
        <Input
          type="text"
          id="major"
          value={formData.major || ''}
          onChange={handleChange}
          placeholder="Your major or field of study"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="graduation_year">Graduation Year</Label>
        <Input
          type="text"
          id="graduation_year"
          value={formData.graduation_year || ''}
          onChange={handleChange}
          placeholder="Expected graduation year"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="experience_level">Experience Level</Label>
        <Input
          type="text"
          id="experience_level"
          value={formData.experience_level || ''}
          onChange={handleChange}
          placeholder="E.g., Beginner, Intermediate, Advanced"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Input
          type="text"
          id="availability"
          value={formData.availability || ''}
          onChange={handleChange}
          placeholder="E.g., Part-time, Full-time, Weekends"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="portfolio_url">Portfolio URL</Label>
        <Input
          type="text"
          id="portfolio_url"
          value={formData.portfolio_url || ''}
          onChange={handleChange}
          placeholder="Link to your portfolio"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="github_url">GitHub URL</Label>
        <Input
          type="text"
          id="github_url"
          value={formData.github_url || ''}
          onChange={handleChange}
          placeholder="Your GitHub profile link"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          type="text"
          id="linkedin_url"
          value={formData.linkedin_url || ''}
          onChange={handleChange}
          placeholder="Your LinkedIn profile link"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="interests">Interests (comma separated)</Label>
        <Input
          type="text"
          id="interests"
          value={Array.isArray(formData.interests) ? formData.interests.join(', ') : ''}
          onChange={handleChange}
          placeholder="Your interests related to projects"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="preferred_categories">Preferred Project Categories (comma separated)</Label>
        <Input
          type="text"
          id="preferred_categories"
          value={Array.isArray(formData.preferred_categories) ? formData.preferred_categories.join(', ') : ''}
          onChange={handleChange}
          placeholder="Categories of projects you're interested in"
        />
      </div>
    </>
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  const isStartup = user.user_metadata?.role === 'startup';

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Please provide the required information to complete your profile. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name*</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
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

              {isStartup ? renderStartupFields() : renderStudentFields()}

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
