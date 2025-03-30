
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Building2, GraduationCap, Clock, Calendar } from "lucide-react";
import FileUpload from '@/components/FileUpload';
import { useProject } from '@/context/ProjectContext';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, updateProfile } = useAuth();
  const { teams } = useProject();
  const [showEditModal, setShowEditModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in");
    }
    
    if (profile) {
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [user, profile, loading, navigate]);

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update profile with new avatar URL
      if (data.publicUrl) {
        await updateProfile({ avatar_url: data.publicUrl });
        setAvatarUrl(data.publicUrl);
        toast.success("Avatar updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // User teams
  const userTeams = teams.filter(team => 
    team.lead_id === user?.id || team.members?.some(member => member.user_id === user?.id)
  );

  if (loading || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const isStudent = profile.role === "student";

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Card */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Profile</CardTitle>
                <Button onClick={() => setShowEditModal(true)}>Edit Profile</Button>
              </div>
              <CardDescription>Your personal details and account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-muted-foreground capitalize">{profile.role}</p>
                  </div>
                  
                  <Separator />
                  
                  {isStudent ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                          {profile.college}, {profile.major}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                          Class of {profile.graduation_year}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                          {profile.availability || "Availability not specified"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                          {profile.company_name || "Company not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                          Founded: {profile.founded || "Year not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Industry:</span>
                        <span className="text-sm">
                          {profile.industry || "Not specified"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.bio || "No bio provided."}
                  </p>
                </div>
                
                {isStudent && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Skills</h3>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <div key={index} className="bg-muted px-2 py-1 rounded-md text-xs">
                            {skill}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed.</p>
                    )}
                  </div>
                )}
                
                {!isStudent && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Project Needs</h3>
                    {profile.project_needs && profile.project_needs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.project_needs.map((need, index) => (
                          <div key={index} className="bg-muted px-2 py-1 rounded-md text-xs">
                            {need}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No project needs listed.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Teams Card */}
          <div className="w-full lg:w-1/3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>Teams you lead or are a member of</CardDescription>
              </CardHeader>
              <CardContent>
                {userTeams.length > 0 ? (
                  <div className="space-y-4">
                    {userTeams.map((team) => (
                      <div 
                        key={team.id} 
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {team.lead_id === user?.id ? "Team Lead" : "Member"}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/teams`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-4">You're not part of any teams yet</p>
                    <Button onClick={() => navigate("/teams")}>
                      Browse Teams
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button variant="secondary" onClick={() => navigate("/complete-profile")}>
              Open Full Profile Editor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
