
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Define the possible user roles
export type UserRole = 'student' | 'startup' | 'college_admin' | 'platform_admin';

// Define the possible permissions
export type Permission = 
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'view_applications'
  | 'manage_applications'
  | 'create_team'
  | 'edit_team'
  | 'delete_team'
  | 'join_team'
  | 'leave_team'
  | 'manage_team_members'
  | 'submit_application'
  | 'verify_college'
  | 'verify_students'
  | 'approve_projects'
  | 'approve_partners'
  | 'manage_users';

interface AuthorizationContextType {
  userRole: UserRole | null;
  isVerified: boolean;
  collegeId: string | null;
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
  verifyCollege: (collegeId: string, verificationCode: string) => Promise<boolean>;
}

const AuthorizationContext = createContext<AuthorizationContextType>({
  userRole: null,
  isVerified: false,
  collegeId: null,
  hasPermission: () => false,
  isLoading: true,
  verifyCollege: async () => false,
});

export const useAuthorization = () => useContext(AuthorizationContext);

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect to fetch user role and verification status
  useEffect(() => {
    const fetchUserAuthorization = async () => {
      if (!user || !profile) {
        setIsLoading(false);
        return;
      }

      try {
        // Set user role from profile
        setUserRole(profile.role as UserRole);

        // Fetch verification status
        const { data, error } = await supabase
          .from('user_verifications')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGSQL_ERROR') {
          console.error('Error fetching verification status:', error);
        } else if (data) {
          setIsVerified(data.is_verified);
          setCollegeId(data.college_id);
        }
      } catch (error) {
        console.error('Error in fetchUserAuthorization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAuthorization();
  }, [user, profile]);

  // Function to check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !userRole) return false;

    // Define permission mappings per role
    const rolePermissions: Record<UserRole, Permission[]> = {
      student: [
        'create_team',
        'edit_team',
        'join_team',
        'leave_team',
        'submit_application'
      ],
      startup: [
        'create_project',
        'edit_project',
        'delete_project',
        'view_applications',
        'manage_applications'
      ],
      college_admin: [
        'verify_students'
      ],
      platform_admin: [
        'create_project',
        'edit_project',
        'delete_project',
        'view_applications',
        'manage_applications',
        'create_team',
        'edit_team',
        'delete_team',
        'manage_team_members',
        'verify_college',
        'verify_students',
        'approve_projects',
        'approve_partners',
        'manage_users'
      ]
    };

    // Check if the user's role has the requested permission
    return rolePermissions[userRole].includes(permission);
  };

  // Function to verify college affiliation
  const verifyCollege = async (collegeId: string, verificationCode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if verification code is valid
      const { data, error } = await supabase
        .from('college_verification_codes')
        .select('*')
        .eq('college_id', collegeId)
        .eq('code', verificationCode)
        .single();

      if (error || !data) {
        toast.error('Invalid verification code');
        return false;
      }

      // Update or insert user verification record
      const { error: upsertError } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: user.id,
          college_id: collegeId,
          is_verified: true,
          verified_at: new Date().toISOString()
        });

      if (upsertError) {
        toast.error('Failed to verify college affiliation');
        return false;
      }

      // Update local state
      setIsVerified(true);
      setCollegeId(collegeId);
      toast.success('College affiliation verified successfully');
      return true;

    } catch (error) {
      console.error('Error in verifyCollege:', error);
      toast.error('Failed to verify college affiliation');
      return false;
    }
  };

  const value = {
    userRole,
    isVerified,
    collegeId,
    hasPermission,
    isLoading,
    verifyCollege
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
};
