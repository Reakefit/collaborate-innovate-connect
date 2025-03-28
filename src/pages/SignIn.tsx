
import React from "react";
import Header from "@/components/Header";
import SignInForm from "@/components/SignInForm";
import { GraduationCap, Briefcase } from "lucide-react";

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="grid md:grid-cols-2 w-full max-w-5xl gap-8 items-center">
          <div className="space-y-6 hidden md:block">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">
                Sign in to access your projects and collaborations
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 rounded-lg border p-4 bg-white/50 backdrop-blur-sm">
                <GraduationCap className="mt-1 h-6 w-6 text-primary" />
                <div className="space-y-1">
                  <h3 className="font-medium">Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Work on real-world projects, build your portfolio, and connect with startups
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 rounded-lg border p-4 bg-white/50 backdrop-blur-sm">
                <Briefcase className="mt-1 h-6 w-6 text-primary" />
                <div className="space-y-1">
                  <h3 className="font-medium">Startups</h3>
                  <p className="text-sm text-muted-foreground">
                    Find talented students to work on your projects and help grow your business
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
