
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth, UserProfile, Education } from "@/context/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const CompleteProfile = () => {
  const { user, profile, updateProfile, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    
    // If profile is already complete, redirect to dashboard
    if (profile && isProfileComplete()) {
      navigate("/dashboard");
    }
  }, [user, profile, isProfileComplete, navigate]);
  
  // Basic information state
  const [basicInfo, setBasicInfo] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
  });
  
  // Student-specific state
  const [education, setEducation] = useState<Education[]>(
    profile?.education || [{ 
      institution: "", 
      degree: "", 
      field: "", 
      startYear: currentYear,
      endYear: null,
      current: true
    }]
  );
  const [skills, setSkills] = useState(profile?.skills ? profile.skills.join(", ") : "");
  const [interests, setInterests] = useState(profile?.interests ? profile.interests.join(", ") : "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio || "");
  const [githubUrl, setGithubUrl] = useState(profile?.github || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin || "");
  const [resumeUrl, setResumeUrl] = useState(profile?.resume || "");
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || "beginner");
  const [availability, setAvailability] = useState(profile?.availability || "part_time");
  
  // Startup-specific state
  const [companyInfo, setCompanyInfo] = useState({
    companyName: profile?.companyName || "",
    companyDescription: profile?.companyDescription || "",
    industry: profile?.industry || "",
    companySize: profile?.companySize || "",
    founded: profile?.founded || currentYear,
    website: profile?.website || ""
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedProfile: Partial<UserProfile> = {
        name: basicInfo.name,
        bio: basicInfo.bio,
      };
      
      if (profile?.role === "student") {
        // Validate student fields
        if (!education[0].institution || !education[0].degree || !education[0].field) {
          toast.error("Please complete your education information");
          setIsSubmitting(false);
          return;
        }
        
        if (!skills) {
          toast.error("Please add at least one skill");
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
      } else if (profile?.role === "startup") {
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
      toast.success("Profile completed successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Add a few more details to personalize your experience and help others know you better
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="basic" onValueChange={setActiveTab} value={activeTab}>
              <div className="px-6">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                  
                  {profile.role === "student" ? (
                    <>
                      <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
                      <TabsTrigger value="skills" className="flex-1">Skills & Interests</TabsTrigger>
                      <TabsTrigger value="links" className="flex-1">Links & Resume</TabsTrigger>
                    </>
                  ) : (
                    <TabsTrigger value="company" className="flex-1">Company Details</TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <form onSubmit={handleSubmit}>
                <TabsContent value="basic" className="p-0">
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
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
                      <Label htmlFor="bio">Bio</Label>
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
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <div></div>
                    <Button 
                      type="button" 
                      onClick={() => profile.role === "student" ? setActiveTab("education") : setActiveTab("company")}
                    >
                      Continue
                    </Button>
                  </CardFooter>
                </TabsContent>
                
                {profile.role === "student" && (
                  <>
                    <TabsContent value="education" className="p-0">
                      <CardContent className="space-y-6 pt-6">
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
                              <Label htmlFor={`institution-${index}`}>Institution</Label>
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
                                <Label htmlFor={`degree-${index}`}>Degree</Label>
                                <Input
                                  id={`degree-${index}`}
                                  placeholder="e.g., Bachelor's"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`field-${index}`}>Field of Study</Label>
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
                                <Label htmlFor={`start-year-${index}`}>Start Year</Label>
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
                                <Label htmlFor={`end-year-${index}`}>End Year</Label>
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
                      </CardContent>
                      
                      <CardFooter className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("basic")}
                        >
                          Back
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("skills")}
                        >
                          Continue
                        </Button>
                      </CardFooter>
                    </TabsContent>
                    
                    <TabsContent value="skills" className="p-0">
                      <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                          <Label htmlFor="skills">Skills (comma separated)</Label>
                          <Textarea
                            id="skills"
                            placeholder="e.g., React, UI Design, Data Analysis"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="min-h-[100px]"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            List your technical and soft skills, separated by commas
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="interests">Areas of Interest (comma separated)</Label>
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
                          <Label htmlFor="experienceLevel">Experience Level</Label>
                          <Select
                            value={experienceLevel}
                            onValueChange={setExperienceLevel}
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
                          <Label htmlFor="availability">Availability</Label>
                          <Select
                            value={availability}
                            onValueChange={setAvailability}
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
                      </CardContent>
                      
                      <CardFooter className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("education")}
                        >
                          Back
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("links")}
                        >
                          Continue
                        </Button>
                      </CardFooter>
                    </TabsContent>
                    
                    <TabsContent value="links" className="p-0">
                      <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                          <Label htmlFor="portfolioUrl">Portfolio URL (optional)</Label>
                          <Input
                            id="portfolioUrl"
                            placeholder="e.g., https://myportfolio.com"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                          <Input
                            id="githubUrl"
                            placeholder="e.g., https://github.com/username"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="linkedinUrl">LinkedIn URL (optional)</Label>
                          <Input
                            id="linkedinUrl"
                            placeholder="e.g., https://linkedin.com/in/username"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="resumeUrl">Resume URL (optional)</Label>
                          <Input
                            id="resumeUrl"
                            placeholder="e.g., https://drive.google.com/resume"
                            value={resumeUrl}
                            onChange={(e) => setResumeUrl(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Link to your resume (Google Drive, Dropbox, etc.)
                          </p>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("skills")}
                        >
                          Back
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Complete Profile"}
                        </Button>
                      </CardFooter>
                    </TabsContent>
                  </>
                )}
                
                {profile.role === "startup" && (
                  <TabsContent value="company" className="p-0">
                    <CardContent className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
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
                        <Label htmlFor="companyDescription">Company Description</Label>
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
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          name="industry"
                          placeholder="e.g., Fintech, Healthcare, E-commerce"
                          value={companyInfo.industry}
                          onChange={handleCompanyInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
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
                        <Label htmlFor="founded">Founded Year</Label>
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
                        <Label htmlFor="website">Company Website</Label>
                        <Input
                          id="website"
                          name="website"
                          placeholder="e.g., https://yourcompany.com"
                          value={companyInfo.website}
                          onChange={handleCompanyInfoChange}
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("basic")}
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Complete Profile"}
                      </Button>
                    </CardFooter>
                  </TabsContent>
                )}
              </form>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
