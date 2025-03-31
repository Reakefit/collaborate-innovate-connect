
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Upload, Link, Briefcase, School, User, Mail, Building } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { userRole } = useAuthorization();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    company_name: '',
    company_description: '',
    skills: [] as string[],
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    college: '',
    major: '',
    graduation_year: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: user?.email || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        company_description: profile.company_description || '',
        skills: profile.skills || [],
        portfolio_url: profile.portfolio_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        college: profile.college || '',
        major: profile.major || '',
        graduation_year: profile.graduation_year || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      setLoading(true);
      
      const updateData = userRole === 'startup' 
        ? {
            name: formData.name,
            bio: formData.bio,
            company_name: formData.company_name,
            company_description: formData.company_description,
            portfolio_url: formData.portfolio_url,
            linkedin_url: formData.linkedin_url,
          }
        : {
            name: formData.name,
            bio: formData.bio,
            skills: formData.skills,
            portfolio_url: formData.portfolio_url,
            github_url: formData.github_url,
            linkedin_url: formData.linkedin_url,
            college: formData.college,
            major: formData.major,
            graduation_year: formData.graduation_year,
          };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout activeTab="profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="profile">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'User'} />
                <AvatarFallback className="text-lg">
                  {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-medium">{profile?.name || 'User'}</h3>
              <p className="text-muted-foreground mb-2">{userRole}</p>
              
              <div className="w-full mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                
                {userRole === 'startup' && profile?.company_name && (
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{profile.company_name}</span>
                  </div>
                )}
                
                {userRole === 'student' && profile?.college && (
                  <div className="flex items-center text-sm">
                    <School className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{profile.college}</span>
                  </div>
                )}
                
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="bg-muted px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 5 && (
                        <span className="bg-muted px-2 py-1 rounded-full text-xs">
                          +{profile.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Edit Form */}
          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  Personal Info
                </TabsTrigger>
                {userRole === 'startup' ? (
                  <TabsTrigger value="company">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Company Info
                  </TabsTrigger>
                ) : (
                  <TabsTrigger value="education">
                    <School className="h-4 w-4 mr-2" />
                    Education
                  </TabsTrigger>
                )}
                <TabsTrigger value="links">
                  <Link className="h-4 w-4 mr-2" />
                  External Links
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            disabled
                            placeholder="Your email address"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email addresses can't be changed
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us a bit about yourself"
                            rows={4}
                          />
                        </div>

                        {userRole === 'student' && (
                          <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input
                              id="skills"
                              name="skills"
                              value={formData.skills.join(', ')}
                              onChange={handleSkillsChange}
                              placeholder="e.g. React, Node.js, UI Design"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button">Cancel</Button>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {userRole === 'startup' ? (
                  <TabsContent value="company">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>
                          Details about your startup
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                              id="company_name"
                              name="company_name"
                              value={formData.company_name}
                              onChange={handleChange}
                              placeholder="Enter your company name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="company_description">Company Description</Label>
                            <Textarea
                              id="company_description"
                              name="company_description"
                              value={formData.company_description}
                              onChange={handleChange}
                              placeholder="Describe your company and its mission"
                              rows={4}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button">Cancel</Button>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                ) : (
                  <TabsContent value="education">
                    <Card>
                      <CardHeader>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>
                          Your educational background
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="college">College/University</Label>
                            <Input
                              id="college"
                              name="college"
                              value={formData.college}
                              onChange={handleChange}
                              placeholder="Enter your college or university"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="major">Major/Field of Study</Label>
                              <Input
                                id="major"
                                name="major"
                                value={formData.major}
                                onChange={handleChange}
                                placeholder="Your major or field of study"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="graduation_year">Graduation Year</Label>
                              <Input
                                id="graduation_year"
                                name="graduation_year"
                                value={formData.graduation_year}
                                onChange={handleChange}
                                placeholder="Expected graduation year"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button">Cancel</Button>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="links">
                  <Card>
                    <CardHeader>
                      <CardTitle>External Links</CardTitle>
                      <CardDescription>
                        Connect your online profiles and portfolio
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="portfolio_url">Portfolio Website</Label>
                          <Input
                            id="portfolio_url"
                            name="portfolio_url"
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                        
                        {userRole === 'student' && (
                          <div className="space-y-2">
                            <Label htmlFor="github_url">GitHub Profile</Label>
                            <Input
                              id="github_url"
                              name="github_url"
                              value={formData.github_url}
                              onChange={handleChange}
                              placeholder="https://github.com/yourusername"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                          <Input
                            id="linkedin_url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/yourusername"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button">Cancel</Button>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </form>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
