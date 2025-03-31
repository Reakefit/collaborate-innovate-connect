
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
  }, [user, profile, authLoading]);

  useEffect(() => {
    // Skip checks if still loading
    if (authLoading || authzLoading) return;

    // Check authentication
    if (!user) {
      // Redirect to appropriate sign-in page based on remembered role
      const rememberedRole = localStorage.getItem('preferredRole');
      if (rememberedRole === 'startup') {
        navigate('/signin/startup', { replace: true });
      } else if (rememberedRole === 'student') {
        navigate('/signin/student', { replace: true });
      } else {
        navigate('/signin', { replace: true });
      }
      return;
    }

    // Skip profile completion check for the complete-profile page
    if (!location.pathname.includes('/complete-profile')) {
      // Check if profile is complete
      if (profile && !profile.name) {
        if (location.pathname !== '/complete-profile') {
          toast.info('Please complete your profile to continue');
          navigate('/complete-profile', { replace: true });
        }
        return;
      }
    }

    // Check verification if required
    if (requireVerification && !isVerified && !location.pathname.includes('/verify-college')) {
      toast.warning('You need to verify your college affiliation first');
      navigate('/verify-college', { replace: true });
      return;
    }

    // Check role if specified
    if (requiredRole && userRole !== requiredRole) {
      toast.error(`This page is only accessible to ${requiredRole}s`);
      navigate('/dashboard', { replace: true });
      return;
    }

    // Check permission if specified
    if (requiredPermission && !hasPermission(requiredPermission)) {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [
    user, 
    userRole, 
    isVerified, 
    requiredRole, 
    requiredPermission, 
    requireVerification, 
    hasPermission, 
    authLoading, 
    authzLoading,
    navigate,
    profile,
    location.pathname
  ]);

  // Show loading state while checking auth/authz
  if (authLoading || authzLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
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

  // If profile is not complete - skip this check for the complete-profile page
  if (profile && !profile.name && !location.pathname.includes('/complete-profile')) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If verification required but not verified
  if (requireVerification && !isVerified && !location.pathname.includes('/verify-college')) {
    return <Navigate to="/verify-college" replace />;
  }

  // If role is required but user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // If permission is required but user doesn't have it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}
