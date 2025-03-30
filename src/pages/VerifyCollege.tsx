
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import CollegeVerification from '@/components/CollegeVerification';

export default function VerifyCollege() {
  const { user, profile } = useAuth();
  const { isVerified, userRole } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate('/signin');
      return;
    }

    // Redirect if user is already verified
    if (isVerified) {
      navigate('/dashboard');
      return;
    }

    // Redirect if user is not a student
    if (profile?.role !== 'student') {
      navigate('/dashboard');
    }
  }, [user, profile, isVerified, userRole, navigate]);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">College Verification</h1>
      <CollegeVerification />
    </div>
  );
}
