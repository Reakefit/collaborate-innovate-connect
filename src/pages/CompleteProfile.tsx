
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";

const CompleteProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    ...(user?.role === "startup" ? {
      companyName: "",
      companyDescription: "",
    } : {
      education: "",
      portfolio: "",
      skills: [],
    }),
  });
  
  const [skillsInput, setSkillsInput] = useState("");
  
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
      // Parse skills from comma-separated string for students
      const updatedData = { ...formData };
      if (user?.role === "student") {
        updatedData.skills = skillsInput.split(",").map(skill => skill.trim()).filter(Boolean);
      }
      
      await updateProfile(updatedData);
      toast.success("Profile completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    navigate("/signin");
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Add a few more details to personalize your experience
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {user.role === "startup" ? (
                  // Startup-specific fields
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Your company name"
                        value={formData.companyName || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">Company Description</Label>
                      <Textarea
                        id="companyDescription"
                        name="companyDescription"
                        placeholder="Tell us about your company..."
                        value={formData.companyDescription || ""}
                        onChange={handleChange}
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                  </>
                ) : (
                  // Student-specific fields
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        name="education"
                        placeholder="e.g., BTech at IIT Delhi"
                        value={formData.education || ""}
                        onChange={handleChange}
                        required
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
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Add your skills separated by commas
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
                      <Input
                        id="portfolio"
                        name="portfolio"
                        placeholder="e.g., https://myportfolio.com"
                        value={formData.portfolio || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
