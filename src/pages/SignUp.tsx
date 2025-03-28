
import React from "react";
import Header from "@/components/Header";
import SignUpForm from "@/components/SignUpForm";
import { GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="grid md:grid-cols-2 w-full max-w-5xl gap-8 items-center">
          <div className="space-y-6 hidden md:block">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">Join our community</h1>
              <p className="text-muted-foreground">
                Connect with students and startups for meaningful collaborations
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg border p-5 bg-white/50 backdrop-blur-sm">
                <h3 className="font-medium flex items-center mb-2">
                  <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                  For Students
                </h3>
                <ul className="space-y-2">
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Work on real-world projects</span>
                  </li>
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Build an impressive portfolio</span>
                  </li>
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Gain valuable industry experience</span>
                  </li>
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Network with startups and other students</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg border p-5 bg-white/50 backdrop-blur-sm">
                <h3 className="font-medium flex items-center mb-2">
                  <Briefcase className="mr-2 h-5 w-5 text-primary" />
                  For Startups
                </h3>
                <ul className="space-y-2">
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Access a pool of talented students</span>
                  </li>
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Get fresh perspectives on your projects</span>
                  </li>
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Connect with the next generation of talent</span>
                  </li>
                  <li className="flex text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cost-effective project completion</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
