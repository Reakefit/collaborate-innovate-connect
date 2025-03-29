import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2 } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose how you'd like to sign in to your account
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/signin/student")}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Student Sign In</CardTitle>
                    <CardDescription>
                      Sign in as a student to work on projects and build your portfolio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access your project applications, track your progress, and collaborate with startups
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Continue as Student
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate("/signin/startup")}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Startup Sign In</CardTitle>
                    <CardDescription>
                      Sign in as a startup to manage projects and find talented students
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage your projects, review applications, and collaborate with student teams
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Continue as Startup
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" onClick={() => navigate("/signup")} className="p-0">
                Sign up
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
