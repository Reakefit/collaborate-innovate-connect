import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Education } from "@/types/database";
import { Briefcase, GraduationCap, Plus, Trash } from "lucide-react";

// Student profile schema
const studentProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  college: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.string().optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  availability: z.enum(["full_time", "part_time", "internship", "contract"]).optional(),
  bio: z.string().optional(),
  portfolio: z.string().url().optional().or(z.string().length(0)),
  github: z.string().url().optional().or(z.string().length(0)),
  linkedin: z.string().url().optional().or(z.string().length(0)),
  resume: z.string().url().optional().or(z.string().length(0)),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startYear: z.number(),
      endYear: z.number().nullable(),
      current: z.boolean().default(false),
    })
  ).optional(),
});

// Startup profile schema
const startupProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  companyDescription: z.string().optional(),
  founded: z.number().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.string().length(0)),
  companySize: z.string().optional(),
  stage: z.string().optional(),
  projectNeeds: z.string().optional(),
});

type StudentProfileValues = z.infer<typeof studentProfileSchema>;
type StartupProfileValues = z.infer<typeof startupProfileSchema>;

type ProfileFormValues = StudentProfileValues | StartupProfileValues;

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  // Initialize form based on user role
  const isStudent = profile?.role === "student";
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(isStudent ? studentProfileSchema : startupProfileSchema),
    defaultValues: isStudent
      ? {
          name: profile?.name || "",
          college: profile?.college || "",
          major: profile?.major || "",
          graduationYear: profile?.graduationYear || "",
          experienceLevel: profile?.experienceLevel || "beginner",
          skills: profile?.skills || [],
          interests: profile?.interests || [],
          availability: profile?.availability || "part_time",
          bio: profile?.bio || "",
          portfolio: profile?.portfolio || "",
          github: profile?.github || "",
          linkedin: profile?.linkedin || "",
          resume: profile?.resume || "",
          education: profile?.education || [],
        }
      : {
          name: profile?.name || "",
          companyName: profile?.companyName || "",
          companyDescription: profile?.companyDescription || "",
          founded: profile?.founded || undefined,
          industry: profile?.industry || "",
          website: profile?.website || "",
          companySize: profile?.companySize || "",
          stage: profile?.stage || "",
          projectNeeds: profile?.projectNeeds || "",
        },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Update the profile
      if (isStudent) {
        const studentValues = values as StudentProfileValues;
        await updateProfile({
          name: studentValues.name,
          bio: studentValues.bio,
          college: studentValues.college,
          major: studentValues.major,
          graduationYear: studentValues.graduationYear,
          experienceLevel: studentValues.experienceLevel,
          skills: studentValues.skills,
          interests: studentValues.interests,
          availability: studentValues.availability,
          portfolio: studentValues.portfolio,
          github: studentValues.github,
          linkedin: studentValues.linkedin,
          resume: studentValues.resume,
          education: studentValues.education as Education[],
        });
      } else {
        const startupValues = values as StartupProfileValues;
        await updateProfile({
          name: startupValues.name,
          companyName: startupValues.companyName,
          companyDescription: startupValues.companyDescription,
          founded: startupValues.founded,
          industry: startupValues.industry,
          website: startupValues.website,
          companySize: startupValues.companySize,
          stage: startupValues.stage,
          projectNeeds: startupValues.projectNeeds,
        });
      }

      // Show success message
      toast.success("Profile updated successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {isStudent
              ? "Tell us more about yourself to help startups find you."
              : "Tell us more about your startup to help students find you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              {isStudent && <TabsTrigger value="student">Student Details</TabsTrigger>}
              {!isStudent && <TabsTrigger value="startup">Startup Details</TabsTrigger>}
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="basic" className="space-y-4">
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
                  {/* Common fields for both student and startup */}
                </TabsContent>

                {isStudent && (
                  <TabsContent value="student" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="college"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College</FormLabel>
                          <FormControl>
                            <Input placeholder="University Name" {...field} />
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
                          <FormLabel>Major</FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., React, Node.js, Python" {...field} />
                          </FormControl>
                          <FormDescription>Enter comma-separated skills</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Web Development, AI, Machine Learning" {...field} />
                          </FormControl>
                          <FormDescription>Enter comma-separated interests</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Write a short bio about yourself" {...field} />
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
                            <Input placeholder="https://portfolio.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://resume.com/resume.pdf" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                )}

                {!isStudent && (
                  <TabsContent value="startup" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
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
                            <Textarea placeholder="Describe your company" {...field} />
                          </FormControl>
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
                            <Input placeholder="2010" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Technology, Healthcare" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1-10, 11-50" {...field} />
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
                          <FormLabel>Stage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Seed, Series A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Needs</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your project needs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                )}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
