import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from "@/context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const educationSchema = z.object({
  institution: z.string().min(2, {
    message: "Institution must be at least 2 characters.",
  }),
  degree: z.string().min(2, {
    message: "Degree must be at least 2 characters.",
  }),
  field: z.string().min(2, {
    message: "Field must be at least 2 characters.",
  }),
  startYear: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num > 1900 && num <= new Date().getFullYear();
  }, {
    message: "Start year must be a valid year between 1900 and the current year.",
  }),
  endYear: z.string().optional().refine((value) => {
    if (!value) return true; // Allow empty value
    const num = Number(value);
    return !isNaN(num) && num >= 1900 && num <= new Date().getFullYear();
  }, {
    message: "End year must be a valid year between 1900 and the current year.",
  }),
  current: z.boolean().default(false),
});

const studentProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  skills: z.array(z.string()).min(1, {
    message: "Please select at least one skill.",
  }),
  education: z.array(educationSchema).min(1, {
    message: "Please add at least one education entry.",
  }),
  portfolio: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  resume: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  github: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  linkedin: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  bio: z.string().max(160, {
    message: "Bio must be less than 160 characters.",
  }).optional(),
  interests: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  college: z.string().min(2, {
    message: "College must be at least 2 characters.",
  }),
  graduationYear: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num >= new Date().getFullYear() && num <= new Date().getFullYear() + 10;
  }, {
    message: "Graduation year must be a valid year between the current year and 10 years from now.",
  }),
  major: z.string().min(2, {
    message: "Major must be at least 2 characters.",
  }),
});

const StudentProfileForm = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
  const handleExperienceLevelChange = (value: "beginner" | "intermediate" | "advanced" | "expert") => {
    setExperienceLevel(value);
  };

  const [availability, setAvailability] = useState<"full_time" | "part_time" | "internship" | "contract">("part_time");
  const handleAvailabilityChange = (value: "full_time" | "part_time" | "internship" | "contract") => {
    setAvailability(value);
  };

  const form = useForm<z.infer<typeof studentProfileSchema>>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      skills: profile?.skills || [],
      education: profile?.education || [],
      portfolio: profile?.portfolio || "",
      resume: profile?.resume || "",
      github: profile?.github || "",
      linkedin: profile?.linkedin || "",
      bio: profile?.bio || "",
      interests: profile?.interests || [],
      preferredCategories: profile?.preferredCategories || [],
      college: profile?.college || "",
      graduationYear: profile?.graduationYear || "",
      major: profile?.major || "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

  const handleSubmit = async (values: z.infer<typeof studentProfileSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const profileData: Partial<UserProfile> = {
        name: values.name,
        skills: values.skills,
        education: values.education,
        portfolio: values.portfolio,
        resume: values.resume,
        github: values.github,
        linkedin: values.linkedin,
        bio: values.bio,
        availability: availability,
        interests: values.interests,
        experienceLevel: experienceLevel,
        preferredCategories: values.preferredCategories,
        college: values.college,
        graduationYear: values.graduationYear,
        major: values.major,
      };

      await updateProfile(profileData);
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
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
              <FormLabel>Skills</FormLabel>
              <Select
                onValueChange={(value) => field.onChange([...field.value, value])}
                defaultValue={field.value[0]}
                multiple
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your skills" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="node">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education</FormLabel>
              <FormControl>
                <Textarea placeholder="Your education details" {...field} />
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
      
      <div className="space-y-2">
        <Label>Experience Level</Label>
        <RadioGroup 
          value={experienceLevel} 
          onValueChange={handleExperienceLevelChange as (value: string) => void}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="r1" />
            <Label htmlFor="r1">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="r2" />
            <Label htmlFor="r2">Intermediate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="r3" />
            <Label htmlFor="r3">Advanced</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expert" id="r4" />
            <Label htmlFor="r4">Expert</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <RadioGroup 
          value={availability} 
          onValueChange={handleAvailabilityChange as (value: string) => void}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full_time" id="a1" />
            <Label htmlFor="a1">Full Time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="part_time" id="a2" />
            <Label htmlFor="a2">Part Time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="internship" id="a3" />
            <Label htmlFor="a3">Internship</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="contract" id="a4" />
            <Label htmlFor="a4">Contract</Label>
          </div>
        </RadioGroup>
      </div>

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </form>
  );
};

const StartupProfileForm = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [foundedDate, setFoundedDate] = React.useState<Date | undefined>(new Date());

  const startupProfileSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    companyName: z.string().min(2, {
      message: "Company name must be at least 2 characters.",
    }),
    companyDescription: z.string().min(10, {
      message: "Company description must be at least 10 characters.",
    }),
    industry: z.string().min(2, {
      message: "Industry must be at least 2 characters.",
    }),
    companySize: z.string().optional(),
    website: z.string().url({
      message: "Please enter a valid URL.",
    }).optional(),
    stage: z.string().optional(),
    projectNeeds: z.string().optional(),
  });

  const form = useForm<z.infer<typeof startupProfileSchema>>({
    resolver: zodResolver(startupProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      companyName: profile?.companyName || "",
      companyDescription: profile?.companyDescription || "",
      industry: profile?.industry || "",
      companySize: profile?.companySize || "",
      website: profile?.website || "",
      stage: profile?.stage || "",
      projectNeeds: profile?.projectNeeds || "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

  const handleSubmit = async (values: z.infer<typeof startupProfileSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const profileData: Partial<UserProfile> = {
        name: values.name,
        companyName: values.companyName,
        companyDescription: values.companyDescription,
        industry: values.industry,
        companySize: values.companySize,
        founded: foundedDate?.getFullYear(),
        website: values.website,
        stage: values.stage,
        projectNeeds: values.projectNeeds,
      };

      await updateProfile(profileData);
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  placeholder="Write a short description about your company"
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
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input placeholder="Your industry" {...field} />
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
                <Input placeholder="Your company size" {...field} />
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
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage</FormLabel>
              <FormControl>
                <Input placeholder="Your company stage" {...field} />
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

        <div className="space-y-2">
          <Label>Founded Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !foundedDate && "text-muted-foreground"
                  )}
                >
                  {foundedDate ? format(foundedDate, "PPP") : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={foundedDate}
                onSelect={setFoundedDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </form>
  );
};

const CompleteProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            {profile.role === "student"
              ? "Tell us more about your skills and experience."
              : "Tell us more about your startup."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.role === "student" ? (
            <StudentProfileForm />
          ) : (
            <StartupProfileForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
