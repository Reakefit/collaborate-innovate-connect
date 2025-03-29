
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, ArrowRight, CheckCircle2, Users, Target, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/30 to-muted/10">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Connect.{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Collaborate.
                </span>{" "}
                Innovate.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
                Bringing together ambitious students and innovative startups for 
                project-based collaborations that benefit everyone.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" onClick={() => navigate("/signup")} className="bg-primary hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/how-it-works")}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="w-full h-80 md:h-96 bg-primary/10 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
                    alt="Students collaborating" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Card className="absolute -bottom-4 -right-4 w-72 shadow-lg">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">
                      "S-S Connect helped our startup find talented students who delivered amazing results!"
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      — Arjun Mehta, CEO at TechInovation
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-background/50" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose S-S Connect?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique benefits for both students and startups looking to collaborate.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Structured Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Well-defined projects with clear objectives, deliverables, and timelines to ensure everyone is aligned.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Team Formation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Flexible team creation tools that let students collaborate effectively based on complementary skills.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Seamless Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in communication tools that keep conversations organized and project-focused.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy for startups and students to connect and collaborate.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Post a Project</h3>
                <p className="text-muted-foreground">
                  Startups can post detailed project requirements with clear deliverables, timeline and compensation.
                </p>
              </CardContent>
            </Card>
            
            {/* Step 2 */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Form Teams & Apply</h3>
                <p className="text-muted-foreground">
                  Students browse projects, form teams or apply individually, showcasing their skills and ideas.
                </p>
              </CardContent>
            </Card>
            
            {/* Step 3 */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Collaborate & Deliver</h3>
                <p className="text-muted-foreground">
                  Teams work closely with startups using our platform tools to communicate, track progress and deliver results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* For Students & Startups Sections */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Students */}
            <Card className="border-none shadow-lg" id="students">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>For Students</CardTitle>
                    <CardDescription>
                      Join as a student to work on real-world projects
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Gain Real-World Experience</h3>
                      <p className="text-muted-foreground">
                        Work on actual projects for startups and build your portfolio with real accomplishments.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Build Your Network</h3>
                      <p className="text-muted-foreground">
                        Connect with innovative startups and fellow students to expand your professional network.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Earn While Learning</h3>
                      <p className="text-muted-foreground">
                        Many projects offer stipends or other forms of compensation for your valuable contributions.
                      </p>
                    </div>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => navigate("/signup/student")}>
                  Join as a Student
                </Button>
              </CardContent>
            </Card>
            
            {/* For Startups */}
            <Card className="border-none shadow-lg" id="startups">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>For Startups</CardTitle>
                    <CardDescription>
                      Join as a startup to find talented students
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Access Fresh Talent</h3>
                      <p className="text-muted-foreground">
                        Find motivated students with the skills and enthusiasm to help grow your business.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Cost-Effective Solutions</h3>
                      <p className="text-muted-foreground">
                        Get high-quality work done at competitive rates while supporting student development.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Build Your Pipeline</h3>
                      <p className="text-muted-foreground">
                        Identify and nurture potential future employees through project collaborations.
                      </p>
                    </div>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => navigate("/signup/startup")}>
                  Join as a Startup
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our community of innovative startups and talented students today and start collaborating on meaningful projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/signup")} className="bg-primary hover:bg-primary/90">
              Sign Up Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/projects")}>
              Browse Projects
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
