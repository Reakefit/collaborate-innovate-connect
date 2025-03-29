import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Profile, Education } from "@/types/database";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Briefcase, GraduationCap, FileText, Link as LinkIcon, Github, Linkedin } from "lucide-react";

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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");

  useEffect(() => {
    // Redirect to complete profile if not fully onboarded
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2">
          <Avatar className="h-24 w-24">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile?.name || "Avatar"} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile ? getInitials(profile.name) : <UserRound className="h-6 w-6" />}
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-2xl font-bold">{profile?.name}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {profile?.role === "student" ? "Student Profile" : "Startup Profile"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
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
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <Input placeholder="Your college name" {...field} />
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
                            <Input placeholder="Your major" {...field} />
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
                            <Input placeholder="e.g., 2024" {...field} />
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
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a short bio about yourself"
                              className="resize-none"
                              {...field}
                            />
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
                            <Input placeholder="Your portfolio URL" {...field} />
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
                            <Input placeholder="Your GitHub URL" {...field} />
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
                            <Input placeholder="Your LinkedIn URL" {...field} />
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
                            <Input placeholder="Your resume URL" {...field} />
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
                            <Input placeholder="Your company name" {...field} />
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
                            <Textarea
                              placeholder="Describe your company"
                              className="resize-none"
                              {...field}
                            />
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
                            <Input placeholder="e.g., 2018" type="number" {...field} />
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
                            <Input placeholder="e.g., Technology" {...field} />
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
                            <Input placeholder="Your website URL" {...field} />
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
                            <Input placeholder="e.g., 11-50 employees" {...field} />
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
                          <FormLabel>Company Stage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Seed" {...field} />
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
                            <Textarea
                              placeholder="Describe your project needs"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Updating Profile..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-2">
          {profile?.website && (
            <Button variant="ghost" asChild>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4" />
                <span>Website</span>
              </a>
            </Button>
          )}
          {profile?.github && (
            <Button variant="ghost" asChild>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>
          )}
          {profile?.linkedin && (
            <Button variant="ghost" asChild>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            </Button>
          )}
          {profile?.resume && (
            <Button variant="ghost" asChild>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Resume</span>
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
