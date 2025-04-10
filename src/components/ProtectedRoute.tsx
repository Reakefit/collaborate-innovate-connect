
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization, Permission } from '@/context/AuthorizationContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'startup' | 'college_admin' | 'platform_admin';
  requiredPermission?: Permission;
  requireVerification?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requireVerification = false,
}: ProtectedRouteProps) {
  const { user, loading: authLoading, profile } = useAuth();
  const { userRole, isVerified, hasPermission, isLoading: authzLoading } = useAuthorization();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Debug logs for troubleshooting
    console.log("ProtectedRoute - user:", user?.id);
    console.log("ProtectedRoute - profile:", profile);
    console.log("ProtectedRoute - userRole:", userRole);
    console.log("ProtectedRoute - isVerified:", isVerified);
    console.log("ProtectedRoute - path:", location.pathname);
    console.log("ProtectedRoute - authLoading:", authLoading);
    console.log("ProtectedRoute - authzLoading:", authzLoading);

    // If user exists but profile doesn't exist in the database,
    // attempt to create it to prevent routing issues
    if (user && !authLoading && !profile) {
      const createUserProfile = async () => {
        try {
          // Check if profile exists
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const userData = {
              id: user.id,
              role: user.user_metadata?.role || 'student',
              name: user.user_metadata?.name || '',
              email: user.email
            };
            
            await supabase.from('profiles').insert(userData);
            console.log("Created user profile for", user.id);
          }
        } catch (error) {
          console.error("Error creating user profile:", error);
        }
      };
      
      createUserProfile();
    }
  }, [user, profile, authLoading, userRole, isVerified, location.pathname, authzLoading]);

  // Show loading state while checking auth/authz
  if (authLoading || authzLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-4 animate-spin text-primary mr-2" />
        <p>Loading...</p>
      </div>
    );
  }

  // If no user, redirect to appropriate login
  if (!user) {
    const rememberedRole = localStorage.getItem('preferredRole');
    if (rememberedRole === 'startup') {
      return <Navigate to="/signin/startup" replace />;
    } else if (rememberedRole === 'student') {
      return <Navigate to="/signin/student" replace />;
    }
    return <Navigate to="/signin" replace />;
  }

  // Check if on complete-profile page
  const isOnCompleteProfilePage = location.pathname === '/complete-profile';
  
  // Only redirect to complete profile if basic required fields are missing
  const needsProfileCompletion = () => {
    if (!profile) return true;
    
    // If profile exists but has no name, profile completion is needed
    if (!profile.name || profile.name.trim() === '') return true;
    
    // For startup, also check company name
    if (profile.role === 'startup' && (!profile.company_name || profile.company_name.trim() === '')) {
      return true;
    }
    
    // For student, also check college
    if (profile.role === 'student' && (!profile.college || profile.college.trim() === '')) {
      return true;
    }
    
    return false;
  };
  
  // Check if profile needs completion and not already on complete-profile page
  if (needsProfileCompletion() && !isOnCompleteProfilePage) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If verification required but not verified
  if (requireVerification && !isVerified && !location.pathname.includes('/verify-college')) {
    return <Navigate to="/verify-college" replace />;
  }

  // If role is required but user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    toast.error(`This page is only accessible to ${requiredRole}s`);
    return <Navigate to="/dashboard" replace />;
  }

  // If permission is required but user doesn't have it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}
