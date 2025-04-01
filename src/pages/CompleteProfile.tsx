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
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Profile } from '@/types/database';
import { Loader2 } from 'lucide-react';

// Define UserRole type to match with what's expected
type UserRole = 'student' | 'startup' | 'college_admin' | 'platform_admin';

const CompleteProfile = () => {
  const { user } = useAuth();
  const { userRole } = useAuthorization();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<Profile>>({
    role: userRole as UserRole || 'student'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userRole) {
      setProfileData(prev => ({ ...prev, role: userRole as UserRole }));
    }
  }, [userRole]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with profileData:', profileData);
    setIsSubmitting(true);

    try {
      // Make sure we have the required fields
      if (!user) {
        toast.error("You must be logged in to complete your profile");
        return;
      }

      // Make sure profileData includes id and role
      const completeProfileData = {
        ...profileData,
        id: user.id,
        role: userRole as UserRole || 'student'
      };

      // Ensure array fields are arrays
      if (completeProfileData.skills && typeof completeProfileData.skills === 'string') {
        completeProfileData.skills = (completeProfileData.skills as string).split(',').map(skill => skill.trim());
      }
      
      if (completeProfileData.interests && typeof completeProfileData.interests === 'string') {
        completeProfileData.interests = (completeProfileData.interests as string).split(',').map(interest => interest.trim());
      }
      
      if (completeProfileData.preferred_categories && typeof completeProfileData.preferred_categories === 'string') {
        completeProfileData.preferred_categories = (completeProfileData.preferred_categories as string).split(',').map(cat => cat.trim());
      }
      
      if (completeProfileData.project_needs && typeof completeProfileData.project_needs === 'string') {
        completeProfileData.project_needs = (completeProfileData.project_needs as string).split(',').map(need => need.trim());
      }

      // Convert education data to JSON if present
      if (completeProfileData.education && Array.isArray(completeProfileData.education)) {
        completeProfileData.education = JSON.stringify(completeProfileData.education);
      }

      console.log('Prepared profile data for submission:', completeProfileData);

      // Update profile in Supabase - pass the single object, not as an array
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
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast.error(`Failed to complete profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={profileData.name || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Role Specific Fields */}
            {profileData.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="college">College</Label>
                  <Input
                    type="text"
                    id="college"
                    name="college"
                    value={profileData.college || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    type="text"
                    id="major"
                    name="major"
                    value={profileData.major || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    type="text"
                    id="graduation_year"
                    name="graduation_year"
                    value={profileData.graduation_year || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    type="text"
                    id="skills"
                    name="skills"
                    value={profileData.skills || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    type="text"
                    id="interests"
                    name="interests"
                    value={profileData.interests || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {profileData.role === 'startup' && (
              <>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={profileData.company_name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="company_description">Company Description</Label>
                  <Textarea
                    id="company_description"
                    name="company_description"
                    value={profileData.company_description || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    type="text"
                    id="industry"
                    name="industry"
                    value={profileData.industry || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input
                    type="text"
                    id="company_size"
                    name="company_size"
                    value={profileData.company_size || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    type="text"
                    id="founded"
                    name="founded"
                    value={profileData.founded || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    type="url"
                    id="website"
                    name="website"
                    value={profileData.website || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Input
                    type="text"
                    id="stage"
                    name="stage"
                    value={profileData.stage || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="project_needs">Project Needs (comma-separated)</Label>
                  <Input
                    type="text"
                    id="project_needs"
                    name="project_needs"
                    value={profileData.project_needs || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    type="text"
                    id="skills"
                    name="skills"
                    value={profileData.skills || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <Button disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
