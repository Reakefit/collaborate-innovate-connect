import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Profile, Education } from '@/types/database';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: any) => Promise<void>;
  signIn: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
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
      const { data: { user } } = await session;

      setUser(user ?? null);
      setLoading(false);
    })();
  }, []);

  // Get user profile after login
  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
      }
    };
    getProfile();
  }, [user]);

  const signUp = async (data: any) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            avatar_url: data.avatar_url,
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

  const signIn = async (data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        throw error;
      }
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
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

      // Convert education array if it exists and is not already in the right format
      if (profileData.education && !Array.isArray(profileData.education)) {
        profileData.education = profileData.education as unknown as Education[];
      }

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
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

  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        // Convert education field if it's stored as JSON
        if (data.education && typeof data.education !== 'undefined') {
          try {
            if (typeof data.education === 'string') {
              data.education = JSON.parse(data.education);
            }
          } catch (e) {
            console.error("Error parsing education data:", e);
            data.education = [];
          }
        }

        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar_url: data.avatar_url,
          bio: data.bio,
          company_name: data.company_name,
          company_description: data.company_description,
          industry: data.industry,
          company_size: data.company_size,
          founded: data.founded,
          website: data.website,
          stage: data.stage,
          project_needs: data.project_needs,
          skills: data.skills,
          education: data.education as Education[],
          portfolio_url: data.portfolio_url,
          resume_url: data.resume_url,
          github_url: data.github_url,
          linkedin_url: data.linkedin_url,
          availability: data.availability,
          interests: data.interests,
          experience_level: data.experience_level,
          preferred_categories: data.preferred_categories,
          college: data.college,
          graduation_year: data.graduation_year,
          major: data.major,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
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
    updateProfile,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
