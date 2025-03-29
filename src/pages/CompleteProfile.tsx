
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Profile, Education } from '@/types/database';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";

const FormWatch = ({ children, control }) => {
  useWatch({
    control
  });
  return children;
};

const educationSchema = z.object({
  institution: z.string().min(2, { message: "Institution must be at least 2 characters." }),
  degree: z.string().min(2, { message: "Degree must be at least 2 characters." }),
  field: z.string().min(2, { message: "Field must be at least 2 characters." }),
  startYear: z.number(),
  endYear: z.number().optional(),
  current: z.boolean().default(false),
});

const studentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  college: z.string().min(2, { message: "College must be at least 2 characters." }),
  major: z.string().min(2, { message: "Major must be at least 2 characters." }),
  graduation_year: z.string().min(4, { message: "Graduation year must be 4 characters." }),
  experience_level: z.string().min(2, { message: "Experience level is required." }),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  availability: z.string().optional(),
  bio: z.string().max(160, { message: "Bio must be less than 160 characters." }).optional(),
  portfolio_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  github_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  linkedin_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  resume_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  education: z.array(educationSchema),
});

const startupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  company_name: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  company_description: z.string().min(10, { message: "Company description must be at least 10 characters." }).max(160, { message: "Company description must be less than 160 characters." }),
  industry: z.string().min(2, { message: "Industry is required." }),
  company_size: z.string().min(2, { message: "Company size is required." }),
  founded: z.string().min(4, { message: "Founded year must be 4 characters." }),
  website: z.string().url({ message: "Please enter a valid URL." }).optional(),
  stage: z.string().min(2, { message: "Stage is required." }),
  project_needs: z.array(z.string()).optional(),
  bio: z.string().max(160, { message: "Bio must be less than 160 characters." }).optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;
type StartupFormValues = z.infer<typeof startupSchema>;

const skillOptions = [
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "ui_ux_design", label: "UI/UX Design" },
  { value: "data_science", label: "Data Science" },
  { value: "machine_learning", label: "Machine Learning" },
  { value: "blockchain", label: "Blockchain" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "devops", label: "DevOps" },
  { value: "project_management", label: "Project Management" },
  { value: "communication", label: "Communication" },
  { value: "leadership", label: "Leadership" },
  { value: "problem_solving", label: "Problem Solving" },
  { value: "critical_thinking", label: "Critical Thinking" },
  { value: "time_management", label: "Time Management" },
  { value: "teamwork", label: "Teamwork" },
];

const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "energy", label: "Energy" },
  { value: "agriculture", label: "Agriculture" },
  { value: "government", label: "Government" },
  { value: "nonprofit", label: "Nonprofit" },
];

const projectNeedsOptions = [
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "ui_ux_design", label: "UI/UX Design" },
  { value: "data_science", label: "Data Science" },
  { value: "machine_learning", label: "Machine Learning" },
  { value: "blockchain", label: "Blockchain" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "devops", label: "DevOps" },
  { value: "project_management", label: "Project Management" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "customer_support", label: "Customer Support" },
  { value: "finance", label: "Finance" },
  { value: "human_resources", label: "Human Resources" },
  { value: "legal", label: "Legal" },
];

// Fix the Education interface to match the required type
const educationDefaultValue: Education[] = [{
  institution: "",
  degree: "",
  field: "",
  startYear: new Date().getFullYear() - 4,
  endYear: new Date().getFullYear(),
  current: false
}];

// Use the correct Education type
const studentDefaultValues = {
  name: "",
  college: "",
  major: "",
  graduation_year: "",
  experience_level: "",
  skills: [] as string[],
  interests: [] as string[],
  availability: "",
  bio: "",
  portfolio_url: "",
  github_url: "",
  linkedin_url: "",
  resume_url: "",
  education: educationDefaultValue,
};

const startupDefaultValues = {
  name: "",
  company_name: "",
  company_description: "",
  industry: "",
  company_size: "",
  founded: "",
  website: "",
  stage: "",
  project_needs: [] as string[],
  bio: "",
};

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isStudent = profile?.role === "student";

  const form = useForm<StudentFormValues | StartupFormValues>({
    resolver: isStudent ? zodResolver(studentSchema) : zodResolver(startupSchema),
    defaultValues: isStudent ? studentDefaultValues : startupDefaultValues,
    mode: "onChange"
  });

  useEffect(() => {
    if (profile) {
      if (isStudent) {
        form.reset({
          name: profile.name || "",
          college: profile.college || "",
          major: profile.major || "",
          graduation_year: profile.graduation_year || "",
          experience_level: profile.experience_level || "",
          skills: profile.skills || [],
          interests: profile.interests || [],
          availability: profile.availability || "",
          bio: profile.bio || "",
          portfolio_url: profile.portfolio_url || "",
          github_url: profile.github_url || "",
          linkedin_url: profile.linkedin_url || "",
          resume_url: profile.resume_url || "",
          education: profile.education || educationDefaultValue,
        });
      } else {
        form.reset({
          name: profile.name || "",
          company_name: profile.company_name || "",
          company_description: profile.company_description || "",
          industry: profile.industry || "",
          company_size: profile.company_size || "",
          founded: profile.founded || "",
          website: profile.website || "",
          stage: profile.stage || "",
          project_needs: profile.project_needs || [],
          bio: profile.bio || "",
        });
      }
    }
  }, [profile, isStudent, form]);

  const onSubmit = async (values: StudentFormValues | StartupFormValues) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const profileData = {
        id: user.id,
        ...values,
      };

      await updateProfile(profileData);
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const skillValues = form.watch("skills") || [];
  const fieldValues = form.watch("interests") || [];
  const projectNeedsValues = form.watch("project_needs") || [];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>
              {isStudent ? "Student Profile" : "Startup Profile"}
            </CardTitle>
            <CardDescription>
              {isStudent
                ? "Tell us about your education, skills, and experience to connect with the right projects."
                : "Share your company's details and project needs to find the perfect student talent."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isStudent ? (
                  <>
                    <FormField
                      control={form.control}
                      name="college"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College</FormLabel>
                          <FormControl>
                            <Input placeholder="Your College" {...field} />
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
                            <Input placeholder="Your Major" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="graduation_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="YYYY"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience_level"
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
                            <MultiSelect
                              options={skillOptions}
                              value={skillValues}
                              onChange={(newValues) => {
                                form.setValue("skills", newValues);
                              }}
                            />
                          </FormControl>
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
                            <MultiSelect
                              options={industryOptions}
                              value={fieldValues}
                              onChange={(newValues) => {
                                form.setValue("interests", newValues);
                              }}
                            />
                          </FormControl>
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
                          <FormControl>
                            <Input
                              placeholder="e.g., 20 hours per week"
                              {...field}
                            />
                          </FormControl>
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
                          <FormDescription>
                            Max 160 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portfolio_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourportfolio.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="github_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://github.com/yourusername"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://linkedin.com/in/yourprofile"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resume_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourdomain.com/resume.pdf"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="company_name"
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
                      name="company_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your company in a few sentences"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Max 160 characters.
                          </FormDescription>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {industryOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                <SelectItem value="501+">501+ employees</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <Input
                              placeholder="YYYY"
                              {...field}
                            />
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
                            <Input
                              placeholder="https://yourcompany.com"
                              {...field}
                            />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="idea">Idea</SelectItem>
                              <SelectItem value="seed">Seed</SelectItem>
                              <SelectItem value="early">Early Stage</SelectItem>
                              <SelectItem value="growth">Growth Stage</SelectItem>
                              <SelectItem value="mature">Mature Stage</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="project_needs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Needs</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={projectNeedsOptions}
                              value={projectNeedsValues}
                              onChange={(newValues) => {
                                form.setValue("project_needs", newValues);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a short bio about your company"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Max 160 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button disabled={isLoading} type="submit">
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
