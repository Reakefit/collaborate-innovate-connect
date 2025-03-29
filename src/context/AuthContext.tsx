import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile, Education } from '@/types/database';
import { toast } from 'sonner';

// Define context shape
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export type { Profile, Education };

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Map database fields to our Profile type
      const mappedProfile: Profile = {
        id: data.id,
        name: data.name,
        role: data.role as 'student' | 'startup',
        avatarUrl: data.avatar_url,
        companyName: data.company_name,
        companyDescription: data.company_description,
        industry: data.industry,
        companySize: data.company_size,
        founded: data.founded,
        website: data.website,
        stage: data.stage,
        projectNeeds: data.project_needs,
        skills: data.skills,
        education: data.education,
        portfolio: data.portfolio_url,
        resume: data.resume_url,
        github: data.github_url,
        linkedin: data.linkedin_url,
        bio: data.bio,
        availability: data.availability as "full_time" | "part_time" | "internship" | "contract",
        interests: data.interests,
        experienceLevel: data.experience_level as "beginner" | "intermediate" | "advanced" | "expert",
        preferredCategories: data.preferred_categories,
        college: data.college,
        graduationYear: data.graduation_year,
        major: data.major
      };

      setProfile(mappedProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      toast.success('Signed in successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Create user with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (error) throw error;

      toast.success('Sign up successful! Please verify your email.');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setProfile(null);

      toast.success('Signed out successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Error signing out');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      setError('User not authenticated');
      toast.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Map our Profile fields to database column names
      const mappedData: any = {
        name: data.name,
        avatar_url: data.avatarUrl,
        company_name: data.companyName,
        company_description: data.companyDescription,
        industry: data.industry,
        company_size: data.companySize,
        founded: data.founded,
        website: data.website,
        stage: data.stage,
        project_needs: data.projectNeeds,
        skills: data.skills,
        education: data.education,
        portfolio_url: data.portfolio,
        resume_url: data.resume,
        github_url: data.github,
        linkedin_url: data.linkedin,
        bio: data.bio,
        availability: data.availability,
        interests: data.interests,
        experience_level: data.experienceLevel,
        preferred_categories: data.preferredCategories,
        college: data.college,
        graduation_year: data.graduationYear,
        major: data.major
      };

      // Remove undefined fields
      Object.keys(mappedData).forEach(key => {
        if (mappedData[key] === undefined) {
          delete mappedData[key];
        }
      });

      const { error } = await supabase
        .from('profiles')
        .update(mappedData)
        .eq('id', user.id);

      if (error) throw error;

      // Refetch profile to ensure we have latest data
      await fetchProfile(user.id);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
