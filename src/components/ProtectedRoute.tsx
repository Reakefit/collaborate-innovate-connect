
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization, Permission } from '@/context/AuthorizationContext';

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
  const { user, loading: authLoading } = useAuth();
  const { userRole, isVerified, hasPermission, isLoading: authzLoading } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip checks if still loading
    if (authLoading || authzLoading) return;

    // Check authentication
    if (!user) {
      navigate('/signin');
      return;
    }

    // Check verification if required
    if (requireVerification && !isVerified) {
      navigate('/verify-college');
      return;
    }

    // Check role if specified
    if (requiredRole && userRole !== requiredRole) {
      navigate('/dashboard');
      return;
    }

    // Check permission if specified
    if (requiredPermission && !hasPermission(requiredPermission)) {
      navigate('/dashboard');
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
    navigate
  ]);

  // Show loading state while checking auth/authz
  if (authLoading || authzLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If verification required but not verified
  if (requireVerification && !isVerified) {
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
