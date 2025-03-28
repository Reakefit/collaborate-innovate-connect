
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User, Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "student" | "startup";

export type EducationLevel = "high_school" | "bachelors" | "masters" | "phd" | "other";

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  avatarUrl?: string;
  // Startup-specific fields
  companyName?: string;
  companyDescription?: string;
  industry?: string;
  companySize?: string;
  founded?: number;
  website?: string;
  // Student-specific fields
  skills?: string[];
  education?: Education[];
  portfolio?: string;
  resume?: string;
  github?: string;
  linkedin?: string;
  bio?: string;
  availability?: "full_time" | "part_time" | "internship" | "contract";
  interests?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  preferredCategories?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isProfileComplete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and set up listener for auth changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user signed in or out, update profile data accordingly
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (currentSession?.user) {
            fetchUserProfile(currentSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
    }).finally(() => {
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          email: user?.email || '',
          name: data.name,
          role: data.role as UserRole,
          createdAt: new Date(data.created_at),
          avatarUrl: data.avatar_url,
          companyName: data.company_name || undefined,
          companyDescription: data.company_description || undefined,
          industry: data.industry || undefined,
          companySize: data.company_size || undefined,
          founded: data.founded || undefined,
          website: data.website || undefined,
          skills: data.skills || undefined,
          education: data.education || undefined,
          portfolio: data.portfolio_url || undefined,
          resume: data.resume_url || undefined,
          github: data.github_url || undefined,
          linkedin: data.linkedin_url || undefined,
          bio: data.bio || undefined,
          availability: data.availability || undefined,
          interests: data.interests || undefined,
          experienceLevel: data.experience_level || undefined,
          preferredCategories: data.preferred_categories || undefined,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast.success("Signed in successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/complete-profile`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // OAuth redirects, so no success message is needed here
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Account created successfully. Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      // Convert from camelCase to snake_case for Supabase
      const snakeCaseData = {
        name: profileData.name,
        avatar_url: profileData.avatarUrl,
        company_name: profileData.companyName,
        company_description: profileData.companyDescription,
        industry: profileData.industry,
        company_size: profileData.companySize,
        founded: profileData.founded,
        website: profileData.website,
        skills: profileData.skills,
        education: profileData.education,
        portfolio_url: profileData.portfolio,
        resume_url: profileData.resume,
        github_url: profileData.github,
        linkedin_url: profileData.linkedin,
        bio: profileData.bio,
        availability: profileData.availability,
        interests: profileData.interests,
        experience_level: profileData.experienceLevel,
        preferred_categories: profileData.preferredCategories
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(snakeCaseData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await fetchUserProfile(user.id);
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      return Promise.reject(error);
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    
    if (profile.role === 'student') {
      return !!(
        profile.name && 
        profile.education && 
        profile.education.length > 0 && 
        profile.skills && 
        profile.skills.length > 0
      );
    } else if (profile.role === 'startup') {
      return !!(
        profile.name && 
        profile.companyName && 
        profile.companyDescription
      );
    }
    
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signInWithProvider,
        signUp,
        signOut,
        updateProfile,
        isProfileComplete
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
