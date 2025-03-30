
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Enhanced form schema with more required fields
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  college: z.string().min(2, { message: 'College name is required' }),
  major: z.string().min(2, { message: 'Major/Field of study is required' }),
  graduationYear: z.string().min(4, { message: 'Graduation year is required' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const SignUpStudent = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      college: '',
      major: '',
      graduationYear: '',
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Register the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'student',
            college: data.college,
            major: data.major,
            graduation_year: data.graduationYear
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // User created successfully
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/signin/student');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating account');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create student account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <Input
                id="college"
                type="text"
                placeholder="Stanford University"
                {...register('college')}
              />
              {errors.college && (
                <p className="text-sm text-red-500">{errors.college.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study</Label>
              <Input
                id="major"
                type="text"
                placeholder="Computer Science"
                {...register('major')}
              />
              {errors.major && (
                <p className="text-sm text-red-500">{errors.major.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Expected Graduation Year</Label>
              <Input
                id="graduationYear"
                type="text"
                placeholder="2025"
                {...register('graduationYear')}
              />
              {errors.graduationYear && (
                <p className="text-sm text-red-500">{errors.graduationYear.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin/student" className="text-primary underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Are you a startup?{' '}
            <Link to="/signup/startup" className="text-primary underline">
              Create startup account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpStudent;
