import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Profile, Education } from '@/types/database';
import { Json } from '@/types/supabase';

type Provider = "google" | "github" | "linkedin_oidc";

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: "student" | "startup") => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  getUserProfile: (userId: string) => Promise<Profile | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithProvider: async () => {},
  updateProfile: async () => {},
  getUserProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });

    (async () => {
      const { data } = await session;
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();
  }, []);

  // Get user profile after login
  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    };
    getProfile();
  }, [user]);

  const signUp = async (email: string, password: string, name: string, role: "student" | "startup") => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            avatar_url: "",
          },
        },
      });

      if (error) {
        throw error;
      }
      if (authData.user) {
        // User created successfully
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/signin');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || `Error signing in with ${provider}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Signed out successfully!');
      navigate('/signin');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create a clean object for the update
      const cleanData: any = { ...profileData };
      
      // Make sure education is properly formatted if it exists
      if (profileData.education) {
        cleanData.education = profileData.education;
      }

      const { error } = await supabase
        .from("profiles")
        .update(cleanData)
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          ...profileData,
        });
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error(error.message || "Error updating profile");
      throw error;
    }
  };

  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        // Convert education field if it's stored as JSON
        let educationData: Education[] = [];
        if (data.education && typeof data.education !== 'undefined') {
          try {
            if (typeof data.education === 'string') {
              educationData = JSON.parse(data.education);
            } else {
              // Cast the education data to the expected type
              educationData = data.education as unknown as Education[];
            }
          } catch (e) {
            console.error("Error parsing education data:", e);
          }
        }

        // Fix type issues with founded and graduation_year
        const founded = typeof data.founded === 'number' ? String(data.founded) : data.founded;
        
        // Fix type issues with array fields
        const skills = Array.isArray(data.skills) ? data.skills : [];
        const interests = Array.isArray(data.interests) ? data.interests : [];
        const preferred_categories = Array.isArray(data.preferred_categories) ? data.preferred_categories : [];
        const project_needs = Array.isArray(data.project_needs) ? data.project_needs : [];

        const profile: Profile = {
          id: data.id,
          name: data.name || '',
          role: data.role as "student" | "startup",
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          company_name: data.company_name || '',
          company_description: data.company_description || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          founded: founded || '',
          website: data.website || '',
          stage: data.stage || '',
          project_needs: project_needs,
          skills: skills,
          education: educationData as unknown as Json, // Cast to Json to satisfy TypeScript
          portfolio_url: data.portfolio_url || '',
          resume_url: data.resume_url || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          availability: data.availability || '',
          interests: interests,
          experience_level: data.experience_level || '',
          preferred_categories: preferred_categories,
          college: data.college || '',
          graduation_year: data.graduation_year || '',
          major: data.major || '',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        return profile;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    updateProfile,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
