
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useAuth, UserProfile } from "@/context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user?.name || "",
    email: user?.email || "",
    ...(user?.role === "startup" ? {
      companyName: user?.companyName || "",
      companyDescription: user?.companyDescription || "",
    } : {
      education: user?.education || "",
      portfolio: user?.portfolio || "",
      skills: user?.skills || [],
    }),
  });
  
  const [skillsInput, setSkillsInput] = useState(
    user?.skills ? user.skills.join(", ") : ""
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Parse skills from comma-separated string
      const updatedData = { ...formData };
      if (user?.role === "student") {
        updatedData.skills = skillsInput.split(",").map(skill => skill.trim()).filter(Boolean);
      }
      
      await updateProfile(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <DashboardLayout activeTab="settings">
        <div className="text-center">Loading profile...</div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout activeTab="settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Cannot be changed
                  </p>
                </div>
              </div>
              
              {user.role === "startup" ? (
                // Startup-specific fields
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Company Description</Label>
                    <Textarea
                      id="companyDescription"
                      name="companyDescription"
                      value={formData.companyDescription || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              ) : (
                // Student-specific fields
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      name="education"
                      placeholder="e.g., BTech at IIT Delhi"
                      value={formData.education || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      placeholder="e.g., React, UI Design, Data Analysis"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input
                      id="portfolio"
                      name="portfolio"
                      placeholder="e.g., https://myportfolio.com"
                      value={formData.portfolio || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Change Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  disabled
                />
                <Button disabled>Update</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password change feature will be available soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
