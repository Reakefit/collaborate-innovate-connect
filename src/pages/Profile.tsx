import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth, UserProfile, Education } from "@/context/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Loader2, User, GraduationCap, Briefcase, Link, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  
  // Early return if no user or profile
  if (!user || !profile) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic information state
  const [basicInfo, setBasicInfo] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
  });
  
  // Student-specific state
  const [education, setEducation] = useState<Education[]>(
    profile.education || [{ 
      institution: "", 
      degree: "", 
      field: "", 
      startYear: currentYear,
      endYear: null,
      current: true
    }]
  );
  const [skills, setSkills] = useState(profile.skills ? profile.skills.join(", ") : "");
  const [interests, setInterests] = useState(profile.interests ? profile.interests.join(", ") : "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio || "");
  const [githubUrl, setGithubUrl] = useState(profile.github || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin || "");
  const [resumeUrl, setResumeUrl] = useState(profile.resume || "");
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || "beginner");
  const [availability, setAvailability] = useState(profile.availability || "part_time");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  
  // Startup-specific state
  const [companyInfo, setCompanyInfo] = useState({
    companyName: profile.companyName || "",
    companyDescription: profile.companyDescription || "",
    industry: profile.industry || "",
    companySize: profile.companySize || "",
    founded: profile.founded || currentYear,
    website: profile.website || ""
  });
  
  const addEducation = () => {
    setEducation([...education, { 
      institution: "", 
      degree: "", 
      field: "", 
      startYear: currentYear,
      endYear: null,
      current: true
    }]);
  };
  
  const removeEducation = (index: number) => {
    if (education.length === 1) {
      toast.error("You need at least one education entry");
      return;
    }
    setEducation(education.filter((_, i) => i !== index));
  };
  
  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    
    // If current is checked, set endYear to null
    if (field === 'current' && value === true) {
      newEducation[index].endYear = null;
    }
    
    setEducation(newEducation);
  };
  
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: value
    });
  };
  
  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      [name]: value
    });
  };
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setResumeFile(file);
    setResumePreview(URL.createObjectURL(file));
  };
  
  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumePreview(null);
    setResumeUrl("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedProfile: Partial<UserProfile> = {
        name: basicInfo.name,
        bio: basicInfo.bio,
      };
      
      if (profile.role === "student") {
        // Validate student fields
        if (education.length > 0 && (!education[0].institution || !education[0].degree || !education[0].field)) {
          toast.error("Please complete your education information");
          setIsSubmitting(false);
          return;
        }
        
        updatedProfile.education = education;
        updatedProfile.skills = skills.split(",").map(skill => skill.trim()).filter(Boolean);
        updatedProfile.interests = interests.split(",").map(interest => interest.trim()).filter(Boolean);
        updatedProfile.portfolio = portfolioUrl;
        updatedProfile.github = githubUrl;
        updatedProfile.linkedin = linkedinUrl;
        updatedProfile.resume = resumeUrl;
        updatedProfile.experienceLevel = experienceLevel as UserProfile["experienceLevel"];
        updatedProfile.availability = availability as UserProfile["availability"];
        
        // Handle resume upload if there's a new file
        if (resumeFile) {
          const fileExt = resumeFile.name.split('.').pop();
          const fileName = `${user.id}-resume.${fileExt}`;
          const filePath = `resumes/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, resumeFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);

          updatedProfile.resume = publicUrl;
        }
      } else if (profile.role === "startup") {
        // Validate startup fields
        if (!companyInfo.companyName || !companyInfo.companyDescription) {
          toast.error("Please complete your company information");
          setIsSubmitting(false);
          return;
        }
        
        updatedProfile.companyName = companyInfo.companyName;
        updatedProfile.companyDescription = companyInfo.companyDescription;
        updatedProfile.industry = companyInfo.industry;
        updatedProfile.companySize = companyInfo.companySize;
        updatedProfile.founded = companyInfo.founded ? Number(companyInfo.founded) : undefined;
        updatedProfile.website = companyInfo.website;
      }
      
      await updateProfile(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
            <p className="text-lg text-muted-foreground">
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
              <Tabs defaultValue="basic" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Basic Info
                  </TabsTrigger>
                  
                  {profile.role === "student" ? (
                    <>
                      <TabsTrigger value="education" className="flex-1">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Education
                      </TabsTrigger>
                      <TabsTrigger value="skills" className="flex-1">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Skills & Interests
                      </TabsTrigger>
                      <TabsTrigger value="links" className="flex-1">
                        <Link className="h-4 w-4 mr-2" />
                        Links & Resume
                      </TabsTrigger>
                    </>
                  ) : (
                    <TabsTrigger value="company" className="flex-1">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Company Info
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <form onSubmit={handleSubmit}>
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={basicInfo.name}
                        onChange={handleBasicInfoChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Tell us about yourself..."
                        value={basicInfo.bio}
                        onChange={handleBasicInfoChange}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        A brief description about yourself and your background
                      </p>
                    </div>
                  </TabsContent>
                  
                  {profile.role === "student" && (
                    <>
                      <TabsContent value="education" className="space-y-6 mt-4">
                        {education.map((edu, index) => (
                          <div key={index} className="space-y-4 pb-4 border-b">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Education #{index + 1}</h3>
                              {education.length > 1 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeEducation(index)}
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor={`institution-${index}`} className="text-sm font-medium">Institution</label>
                              <Input
                                id={`institution-${index}`}
                                placeholder="e.g., Harvard University"
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor={`degree-${index}`} className="text-sm font-medium">Degree</label>
                                <Input
                                  id={`degree-${index}`}
                                  placeholder="e.g., Bachelor's"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label htmlFor={`field-${index}`} className="text-sm font-medium">Field of Study</label>
                                <Input
                                  id={`field-${index}`}
                                  placeholder="e.g., Computer Science"
                                  value={edu.field}
                                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor={`start-year-${index}`} className="text-sm font-medium">Start Year</label>
                                <Select
                                  value={edu.startYear?.toString()}
                                  onValueChange={(value) => updateEducation(index, 'startYear', Number(value))}
                                >
                                  <SelectTrigger id={`start-year-${index}`}>
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {years.map((year) => (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <label htmlFor={`end-year-${index}`} className="text-sm font-medium">End Year</label>
                                <div className="flex items-center space-x-2">
                                  <Select
                                    value={edu.endYear?.toString() || ""}
                                    onValueChange={(value) => updateEducation(index, 'endYear', value ? Number(value) : null)}
                                    disabled={edu.current}
                                  >
                                    <SelectTrigger id={`end-year-${index}`} className="flex-1">
                                      <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                          {year}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Checkbox 
                                    id={`current-${index}`} 
                                    checked={edu.current}
                                    onCheckedChange={(checked) => 
                                      updateEducation(index, 'current', checked === true)
                                    }
                                  />
                                  <label
                                    htmlFor={`current-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    I'm currently studying here
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={addEducation}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Another Education
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="skills" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <label htmlFor="skills" className="text-sm font-medium">Skills (comma separated)</label>
                          <Textarea
                            id="skills"
                            placeholder="e.g., React, UI Design, Data Analysis"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            List your technical and soft skills, separated by commas
                          </p>
                        </div>
                        
                        {profile.skills && profile.skills.length > 0 && (
                          <div className="mt-2">
                            <label className="text-sm font-medium">Current Skills</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {profile.skills.map((skill, index) => (
                                <div key={index} className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                                  {skill}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <label htmlFor="interests" className="text-sm font-medium">Areas of Interest (comma separated)</label>
                          <Textarea
                            id="interests"
                            placeholder="e.g., AI, Fintech, Healthcare"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            What industries or project types are you most interested in?
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="experienceLevel" className="text-sm font-medium">Experience Level</label>
                          <Select
                            value={experienceLevel}
                            onValueChange={(value: "beginner" | "intermediate" | "advanced" | "expert") => setExperienceLevel(value)}
                          >
                            <SelectTrigger id="experienceLevel">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                              <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                              <SelectItem value="expert">Expert (5+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="availability" className="text-sm font-medium">Availability</label>
                          <Select
                            value={availability}
                            onValueChange={(value: "full_time" | "part_time" | "internship" | "contract") => setAvailability(value)}
                          >
                            <SelectTrigger id="availability">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_time">Full-time</SelectItem>
                              <SelectItem value="part_time">Part-time</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                              <SelectItem value="contract">Contract / Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="links" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <label htmlFor="portfolioUrl" className="text-sm font-medium">Portfolio URL (optional)</label>
                          <Input
                            id="portfolioUrl"
                            placeholder="e.g., https://myportfolio.com"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="githubUrl" className="text-sm font-medium">GitHub URL (optional)</label>
                          <Input
                            id="githubUrl"
                            placeholder="e.g., https://github.com/username"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn URL (optional)</label>
                          <Input
                            id="linkedinUrl"
                            placeholder="e.g., https://linkedin.com/in/username"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Resume</label>
                          <div className="flex items-center gap-4">
                            {resumePreview || resumeUrl ? (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm truncate">
                                  {resumeFile?.name || "Current Resume"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleRemoveResume}
                                  className="h-4 w-4 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={handleResumeUpload}
                                  className="hidden"
                                  id="resume-upload"
                                />
                                <label
                                  htmlFor="resume-upload"
                                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>Upload Resume</span>
                                </label>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload your resume (PDF or Word document, max 5MB)
                          </p>
                        </div>
                      </TabsContent>
                    </>
                  )}
                  
                  {profile.role === "startup" && (
                    <TabsContent value="company" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                        <Input
                          id="companyName"
                          name="companyName"
                          placeholder="Your company name"
                          value={companyInfo.companyName}
                          onChange={handleCompanyInfoChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="companyDescription" className="text-sm font-medium">Company Description</label>
                        <Textarea
                          id="companyDescription"
                          name="companyDescription"
                          placeholder="Tell us about your company..."
                          value={companyInfo.companyDescription}
                          onChange={handleCompanyInfoChange}
                          className="min-h-[120px]"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="industry" className="text-sm font-medium">Industry</label>
                        <Input
                          id="industry"
                          name="industry"
                          placeholder="e.g., Fintech, Healthcare, E-commerce"
                          value={companyInfo.industry}
                          onChange={handleCompanyInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="companySize" className="text-sm font-medium">Company Size</label>
                        <Select
                          value={companyInfo.companySize}
                          onValueChange={(value) => setCompanyInfo({...companyInfo, companySize: value})}
                        >
                          <SelectTrigger id="companySize">
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
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="founded" className="text-sm font-medium">Founded Year</label>
                        <Select
                          value={companyInfo.founded?.toString() || ''}
                          onValueChange={(value) => setCompanyInfo({...companyInfo, founded: Number(value)})}
                        >
                          <SelectTrigger id="founded">
                            <SelectValue placeholder="Select year founded" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="website" className="text-sm font-medium">Company Website</label>
                        <Input
                          id="website"
                          name="website"
                          placeholder="e.g., https://yourcompany.com"
                          value={companyInfo.website}
                          onChange={handleCompanyInfoChange}
                        />
                      </div>
                    </TabsContent>
                  )}
                  
                  <div className="mt-6">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
