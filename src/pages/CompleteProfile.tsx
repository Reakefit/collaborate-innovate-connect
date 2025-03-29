
import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile, Education } from "@/context/AuthContext";
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

// Create a proper schema for Education that matches our database type
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
  startYear: z.coerce.number().min(1900, {
    message: "Start year must be a valid year after 1900.",
  }).max(new Date().getFullYear(), {
    message: "Start year cannot be in the future.",
  }),
  endYear: z.coerce.number().optional().nullable(),
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
  }).optional().or(z.literal('')),
  resume: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  github: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  linkedin: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  bio: z.string().max(160, {
    message: "Bio must be less than 160 characters.",
  }).optional().or(z.literal('')),
  interests: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  college: z.string().min(2, {
    message: "College must be at least 2 characters.",
  }).optional().or(z.literal('')),
  graduationYear: z.string().refine((value) => {
    if (!value) return true; // Allow empty string
    const num = Number(value);
    return !isNaN(num) && num >= new Date().getFullYear() && num <= new Date().getFullYear() + 10;
  }, {
    message: "Graduation year must be a valid year between the current year and 10 years from now.",
  }).optional().or(z.literal('')),
  major: z.string().min(2, {
    message: "Major must be at least 2 characters.",
  }).optional().or(z.literal('')),
});

const StudentProfileForm = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">(
    profile?.experienceLevel || "beginner"
  );
  
  const handleExperienceLevelChange = (value: string) => {
    setExperienceLevel(value as "beginner" | "intermediate" | "advanced" | "expert");
  };

  const [availability, setAvailability] = useState<"full_time" | "part_time" | "internship" | "contract">(
    profile?.availability || "part_time"
  );
  
  const handleAvailabilityChange = (value: string) => {
    setAvailability(value as "full_time" | "part_time" | "internship" | "contract");
  };

  // Convert education format if needed
  const convertEducation = (education: any[] | undefined): Education[] => {
    if (!education) return [];
    
    // Check if the education is already in the right format
    if (education.length > 0 && 'institution' in education[0]) {
      return education as Education[];
    }
    
    // Convert from form format to Education format
    return education.map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startYear: Number(edu.startYear) || new Date().getFullYear(),
      endYear: edu.current ? null : (Number(edu.endYear) || null),
      current: edu.current || false,
    }));
  };

  const form = useForm<z.infer<typeof studentProfileSchema>>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      skills: profile?.skills || [],
      education: convertEducation(profile?.education),
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
              <div className="space-y-2">
                {["javascript", "typescript", "react", "node", "python", "java"].map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={field.value?.includes(skill)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...field.value, skill])
                          : field.onChange(field.value?.filter((s) => s !== skill));
                      }}
                    />
                    <label
                      htmlFor={`skill-${skill}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Education field - this needs special handling */}
        <div className="space-y-2">
          <FormLabel>Education</FormLabel>
          <div className="space-y-4 border p-4 rounded-md">
            <p className="text-sm text-gray-500">Add your education history</p>
            {/* Display education entries */}
            {form.watch('education')?.map((edu, index) => (
              <div key={index} className="p-3 border rounded-md bg-gray-50">
                <p><strong>Institution:</strong> {edu.institution}</p>
                <p><strong>Degree:</strong> {edu.degree}</p>
                <p><strong>Field:</strong> {edu.field}</p>
                <p><strong>Years:</strong> {edu.startYear} - {edu.current ? 'Present' : edu.endYear}</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const currentEducation = [...form.watch('education')];
                    currentEducation.splice(index, 1);
                    form.setValue('education', currentEducation);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            {/* Add new education entry form */}
            <div className="p-3 border rounded-md">
              <h4 className="text-sm font-medium mb-2">Add Education</h4>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" placeholder="University/College name" />
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" placeholder="e.g., Bachelor's, Master's" />
                </div>
                <div>
                  <Label htmlFor="field">Field of Study</Label>
                  <Input id="field" placeholder="e.g., Computer Science" />
                </div>
                <div>
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input id="startYear" type="number" min="1900" max={new Date().getFullYear()} placeholder="Start Year" />
                </div>
                <div>
                  <Label htmlFor="endYear">End Year</Label>
                  <Input id="endYear" type="number" min="1900" max={new Date().getFullYear() + 10} placeholder="End Year" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="current" />
                  <Label htmlFor="current">I currently study here</Label>
                </div>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    const institution = (document.getElementById('institution') as HTMLInputElement)?.value;
                    const degree = (document.getElementById('degree') as HTMLInputElement)?.value;
                    const field = (document.getElementById('field') as HTMLInputElement)?.value;
                    const startYear = (document.getElementById('startYear') as HTMLInputElement)?.value;
                    const endYear = (document.getElementById('endYear') as HTMLInputElement)?.value;
                    const current = (document.getElementById('current') as HTMLInputElement)?.checked;
                    
                    if (!institution || !degree || !field || !startYear) {
                      toast.error("Please fill all required fields");
                      return;
                    }
                    
                    const newEducation = {
                      institution,
                      degree,
                      field,
                      startYear: Number(startYear),
                      endYear: current ? null : (endYear ? Number(endYear) : null),
                      current: !!current
                    };
                    
                    const currentEducation = [...form.watch('education'), newEducation];
                    form.setValue('education', currentEducation);
                    
                    // Clear the form
                    (document.getElementById('institution') as HTMLInputElement).value = '';
                    (document.getElementById('degree') as HTMLInputElement).value = '';
                    (document.getElementById('field') as HTMLInputElement).value = '';
                    (document.getElementById('startYear') as HTMLInputElement).value = '';
                    (document.getElementById('endYear') as HTMLInputElement).value = '';
                    (document.getElementById('current') as HTMLInputElement).checked = false;
                  }}
                >
                  Add Education
                </Button>
              </div>
            </div>
          </div>
          {form.formState.errors.education && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.education.message}</p>
          )}
        </div>

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
          onValueChange={handleExperienceLevelChange}
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
          onValueChange={handleAvailabilityChange}
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
