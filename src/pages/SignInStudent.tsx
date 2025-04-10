
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from 'sonner';

const SignInStudent = () => {
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Store student as preferred role
  useEffect(() => {
    localStorage.setItem('preferredRole', 'student');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      
      // Check if the user is a student
      if (profile && profile.role !== 'student') {
        toast.error('This account is not registered as a student. Please use the appropriate login page.');
        return;
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      toast.error('Login failed: ' + (error.message || 'Invalid credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-[450px]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Student Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">
                <Mail className="mr-2 h-4 w-4 inline" />
                Email
              </Label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="password">
                <Lock className="mr-2 h-4 w-4 inline" />
                Password
              </Label>
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            <Button disabled={isLoading} className="w-full mt-4" type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </Button>
          </form>
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account? <Link to="/signup/student" className="text-primary underline">Sign up</Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <Link to="/forgot-password" className="text-primary underline">Forgot password?</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInStudent;
