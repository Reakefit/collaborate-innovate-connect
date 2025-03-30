
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Enhanced form schema with more required fields
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  companyDescription: z.string().min(10, { message: 'Please provide a company description (min 10 characters)' }),
  industry: z.string().min(2, { message: 'Industry is required' }),
  companySize: z.string().min(1, { message: 'Company size is required' }),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  founded: z.string().regex(/^\d{4}$/, { message: 'Please enter a valid year (YYYY)' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const SignUpStartup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      companyDescription: '',
      industry: '',
      companySize: '',
      website: '',
      founded: '',
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // First, register the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'startup',
            company_name: data.companyName,
            company_description: data.companyDescription,
            industry: data.industry,
            company_size: data.companySize,
            website: data.website || null,
            founded: data.founded
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // User created successfully
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/signin/startup');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating account');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle select changes manually
  const handleSelectChange = (field: string, value: string) => {
    setValue(field as any, value, { shouldValidate: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Startup Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create a startup account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Person Name</Label>
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
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Acme Corp"
                {...register('companyName')}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                placeholder="Tell us about your company..."
                {...register('companyDescription')}
                className="h-24"
              />
              {errors.companyDescription && (
                <p className="text-sm text-red-500">{errors.companyDescription.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  type="text"
                  placeholder="Technology, Finance, etc."
                  {...register('industry')}
                />
                {errors.industry && (
                  <p className="text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select onValueChange={(value) => handleSelectChange('companySize', value)}>
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501+">501+ employees</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('companySize')} />
                {errors.companySize && (
                  <p className="text-sm text-red-500">{errors.companySize.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">{errors.website.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  type="text"
                  placeholder="2020"
                  {...register('founded')}
                />
                {errors.founded && (
                  <p className="text-sm text-red-500">{errors.founded.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Link to="/signin/startup" className="text-primary underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Are you a student?{' '}
            <Link to="/signup/student" className="text-primary underline">
              Create student account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpStartup;
