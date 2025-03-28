import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  
  // Early return if no user or profile
  if (!user || !profile) {
    return <DashboardLayout activeTab="profile">
      <div>Loading profile...</div>
    </DashboardLayout>;
  }
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const profileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    companyName: z.string().optional(),
    companyDescription: z.string().optional(),
    education: z.string().optional(),
    portfolio: z.string().optional(),
    skills: z.string().optional(),
  });
  
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      companyName: profile.companyName || "",
      companyDescription: profile.companyDescription || "",
      education: profile.education || "",
      portfolio: profile.portfolio || "",
      skills: profile.skills ? profile.skills.join(", ") : "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        name: values.name,
        companyName: values.companyName,
        companyDescription: values.companyDescription,
        education: values.education,
        portfolio: values.portfolio,
        skills: values.skills ? values.skills.split(",").map((skill) => skill.trim()) : [],
      };
      
      await updateProfile(profileData);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout activeTab="profile">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {profile.role === "startup" ? (
                  // Startup-specific form
                  <div>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your company..." className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  // Student-specific form
                  <div>
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., BTech at IIT Delhi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="portfolio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., https://myportfolio.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., React, UI Design, Data Analysis" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <div key={index} className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Add more sections here as needed, e.g., account settings, preferences, etc. */}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
