
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Building2, ArrowRight, FileCheck, Users, MessageSquare, Target } from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/10">
      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How S-S Connect Works</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform connects startups with talented students for project-based collaborations. 
            Here's how the process works for everyone involved.
          </p>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[50%] w-0.5 h-full bg-primary/20 hidden md:block"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center mb-16 relative">
              <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right">
                <div className="bg-primary/10 inline-flex rounded-lg p-3 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">1. Startups Post Projects</h3>
                <p className="text-muted-foreground">
                  Startups create detailed project listings outlining objectives, deliverables, 
                  timeline, and compensation. Clear expectations set the foundation for success.
                </p>
              </div>
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center z-10 mx-4 md:mx-0">1</div>
              <div className="md:w-1/2 md:pl-12 flex justify-center">
                <Card className="w-full max-w-sm overflow-hidden">
                  <div className="h-44 bg-muted flex items-center justify-center">
                    <FileCheck className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Project Requirements</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Project title and description</li>
                      <li>• Required skills and deliverables</li>
                      <li>• Timeline and compensation details</li>
                      <li>• Team size and project category</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col-reverse md:flex-row items-center mb-16 relative">
              <div className="md:w-1/2 md:pr-12 flex justify-center">
                <Card className="w-full max-w-sm overflow-hidden">
                  <div className="h-44 bg-muted flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Student Teams</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Create or join student teams</li>
                      <li>• Team profile with complementary skills</li>
                      <li>• Apply to projects as a team</li>
                      <li>• Collaborate with fellow students</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center z-10 mx-4 md:mx-0">2</div>
              <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
                <div className="bg-primary/10 inline-flex rounded-lg p-3 mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">2. Students Form Teams</h3>
                <p className="text-muted-foreground">
                  Students create or join teams based on complementary skills and interests. 
                  Teams can then browse available projects and submit applications for ones that match their capabilities.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center mb-16 relative">
              <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right">
                <div className="bg-primary/10 inline-flex rounded-lg p-3 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">3. Project Selection Process</h3>
                <p className="text-muted-foreground">
                  Startups review team applications, assessing skills, experience, and cover letters. 
                  They can shortlist, interview, and ultimately select the team that best fits their project needs.
                </p>
              </div>
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center z-10 mx-4 md:mx-0">3</div>
              <div className="md:w-1/2 md:pl-12 flex justify-center">
                <Card className="w-full max-w-sm overflow-hidden">
                  <div className="h-44 bg-muted flex items-center justify-center">
                    <Target className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Selection Process</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Review team applications</li>
                      <li>• Assess team skills and experience</li>
                      <li>• Interview shortlisted teams</li>
                      <li>• Select final team and kickoff</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col-reverse md:flex-row items-center relative">
              <div className="md:w-1/2 md:pr-12 flex justify-center">
                <Card className="w-full max-w-sm overflow-hidden">
                  <div className="h-44 bg-muted flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Collaboration Tools</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Project dashboard & milestones</li>
                      <li>• Task management system</li>
                      <li>• Team messaging & file sharing</li>
                      <li>• Progress tracking & feedback</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center z-10 mx-4 md:mx-0">4</div>
              <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
                <div className="bg-primary/10 inline-flex rounded-lg p-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">4. Collaboration & Delivery</h3>
                <p className="text-muted-foreground">
                  Teams work closely with startups using our built-in tools for communication, 
                  task management, and milestone tracking. Both parties can monitor progress and provide feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background/70">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">How much does it cost?</h3>
              <p className="text-muted-foreground">
                The platform is free for students to join and apply to projects. For startups, 
                we offer various subscription plans based on your project needs and volume.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">What types of projects can be posted?</h3>
              <p className="text-muted-foreground">
                Startups can post projects across various categories including software development, 
                market research, design, content creation, and more.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">How are payments handled?</h3>
              <p className="text-muted-foreground">
                Projects can use various compensation models including stipends, equity, or certificates. 
                Payment terms are set by the startup during project creation.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">How long do projects typically last?</h3>
              <p className="text-muted-foreground">
                Projects can range from short-term (2-4 weeks) to longer engagements (3-6 months), 
                depending on the scope and complexity defined by the startup.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Collaborating?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our community of innovative startups and talented students today.
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

export default HowItWorks;
