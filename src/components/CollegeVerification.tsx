
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '@/context/AuthorizationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type College = {
  id: string;
  name: string;
  domain: string;
  country: string;
};

// This would ideally come from your backend
const APPROVED_COLLEGES: College[] = [
  { id: '1', name: 'Harvard University', domain: 'harvard.edu', country: 'USA' },
  { id: '2', name: 'Stanford University', domain: 'stanford.edu', country: 'USA' },
  { id: '3', name: 'MIT', domain: 'mit.edu', country: 'USA' },
  // Add more approved colleges here
];

export default function CollegeVerification() {
  const { isVerified, verifyCollege } = useAuthorization();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleVerification = async () => {
    if (!selectedCollege) {
      toast.error('Please select your college');
      return;
    }

    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await verifyCollege(selectedCollege, verificationCode);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Your college affiliation is verified</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 font-medium">
            Your account is verified and you have full access to the platform.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>College Verification</CardTitle>
        <CardDescription>
          Verify your college affiliation to access exclusive opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="college">Select Your College/University</Label>
          <Select 
            value={selectedCollege} 
            onValueChange={setSelectedCollege}
          >
            <SelectTrigger id="college">
              <SelectValue placeholder="Select college" />
            </SelectTrigger>
            <SelectContent>
              {APPROVED_COLLEGES.map((college) => (
                <SelectItem key={college.id} value={college.id}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            placeholder="Enter code provided by your institution"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Don't have a code? Contact your college administrator or student affairs office.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerification} 
          disabled={isSubmitting || !selectedCollege || !verificationCode}
          className="w-full"
        >
          {isSubmitting ? 'Verifying...' : 'Verify College Affiliation'}
        </Button>
      </CardFooter>
    </Card>
  );
}
