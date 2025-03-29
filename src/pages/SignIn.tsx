
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sign in to your S-S Connect account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student SignIn */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Student Sign In</CardTitle>
              <CardDescription>
                Access your student account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate("/signin/student")}
                size="lg"
              >
                Sign In as Student
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-sm text-center text-muted-foreground pt-2">
                <span>Don't have an account? </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => navigate("/signup/student")}
                >
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Startup SignIn */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Startup Sign In</CardTitle>
              <CardDescription>
                Access your startup account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate("/signin/startup")}
                size="lg"
              >
                Sign In as Startup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-sm text-center text-muted-foreground pt-2">
                <span>Don't have an account? </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => navigate("/signup/startup")}
                >
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
