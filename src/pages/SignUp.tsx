
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Join S-S Connect</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you want to participate in our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Signup */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>I'm a Student</CardTitle>
              <CardDescription>
                Looking to gain experience and work on real projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Apply to exciting startup projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Build your portfolio with real-world work</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Form or join teams with other students</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Earn stipends or gain equity opportunities</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => navigate("/signup/student")}
                size="lg"
              >
                Sign Up as Student
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-sm text-center text-muted-foreground pt-2">
                <span>Already have an account? </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => navigate("/signin/student")}
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Startup Signup */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>I'm a Startup</CardTitle>
              <CardDescription>
                Looking to find talented students for my projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Post projects and find student talent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Get quality work at cost-effective rates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Track project progress with our tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Build your talent pipeline for future hires</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => navigate("/signup/startup")}
                size="lg"
              >
                Sign Up as Startup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-sm text-center text-muted-foreground pt-2">
                <span>Already have an account? </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => navigate("/signin/startup")}
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
