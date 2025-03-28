
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

export type UserRole = "student" | "startup";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  // Startup-specific fields
  companyName?: string;
  companyDescription?: string;
  // Student-specific fields
  skills?: string[];
  education?: string;
  portfolio?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication for MVP - would be replaced with real auth in production
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // For demo purposes, just check if a user with this email exists in localStorage
      const storedUser = localStorage.getItem(`user_${email}`);
      
      if (!storedUser) {
        throw new Error("Invalid email or password");
      }
      
      const user = JSON.parse(storedUser);
      // In a real app, you'd verify the password here
      
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Signed in successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Check if user already exists (for demo purposes)
      const existingUser = localStorage.getItem(`user_${email}`);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      
      // Create new user
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date(),
        // Initialize other fields based on role
        ...(role === "startup" ? { companyName: "", companyDescription: "" } : {}),
        ...(role === "student" ? { skills: [], education: "", portfolio: "" } : {})
      };
      
      // Save user data
      localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      localStorage.setItem("user", JSON.stringify(newUser));
      
      setUser(newUser);
      toast.success("Account created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Signed out successfully");
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      const updatedUser = { ...user, ...profile };
      localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      toast.success("Profile updated successfully");
      return Promise.resolve();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
