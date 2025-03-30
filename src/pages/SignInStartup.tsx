
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Mail, Lock } from "lucide-react";
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const SignInStartup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Store startup as preferred role
  useEffect(() => {
    localStorage.setItem('preferredRole', 'startup');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      
      // Check if the user is a startup
      if (profile && profile.role !== 'startup') {
        toast.error('This account is not registered as a startup. Please use the appropriate login page.');
        return;
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-muted/30 to-muted/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In as Startup</CardTitle>
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
                placeholder="mail@example.com"
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
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account? <Link to="/signup/startup" className="text-primary hover:underline">Sign up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInStartup;
