
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization, Permission } from '@/context/AuthorizationContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createUserProfileIfNotExists } from '@/services/database';

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
      const userData = {
        role: user.user_metadata?.role || 'student',
        name: user.user_metadata?.name || '',
        email: user.email
      };
      createUserProfileIfNotExists(user.id, userData);
    }
  }, [user, profile, authLoading, userRole, isVerified, location.pathname, authzLoading]);

  // Handle profile completion checks
  const needsProfileCompletion = () => {
    if (!profile || !profile.name) return true;
    
    const isStartup = profile.role === 'startup';
    
    if (isStartup) {
      return !profile.company_name || !profile.company_description;
    }
    
    return !profile.skills || profile.skills.length === 0 || !profile.college;
  };

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
