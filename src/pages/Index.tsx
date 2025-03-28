
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-accent py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary-foreground">
                Connect. Collaborate. <span className="text-primary">Innovate.</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-foreground max-w-lg">
                Bringing together ambitious students and innovative startups for 
                project-based collaborations that benefit everyone.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/signup")}>
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
                <div className="w-full h-80 md:h-96 bg-primary/10 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
                    alt="Students collaborating" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white shadow-lg rounded-lg p-4 max-w-xs">
                  <p className="font-medium text-foreground">
                    "S-S Connect helped our startup find talented students who delivered amazing results!"
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    — Arjun Mehta, CEO at TechInovation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy for startups and students to connect and collaborate on meaningful projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post a Project</h3>
              <p className="text-muted-foreground">
                Startups can post detailed project requirements with clear deliverables, timeline and compensation.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Form Teams & Apply</h3>
              <p className="text-muted-foreground">
                Students browse projects, form teams or apply individually, showcasing their skills and ideas.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborate & Deliver</h3>
              <p className="text-muted-foreground">
                Teams work closely with startups using our platform tools to communicate, track progress and deliver results.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button onClick={() => navigate("/how-it-works")}>
              Learn More About the Process
            </Button>
          </div>
        </div>
      </section>
      
      {/* For Students & Startups Sections */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Students */}
            <div>
              <h2 className="text-2xl font-bold mb-6">For Students</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-4 mt-1 bg-primary/20 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Gain Real-World Experience</h3>
                    <p className="text-muted-foreground">
                      Work on actual projects for startups and build your portfolio with real accomplishments.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 bg-primary/20 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Build Your Network</h3>
                    <p className="text-muted-foreground">
                      Connect with innovative startups and fellow students to expand your professional network.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 bg-primary/20 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Earn While Learning</h3>
                    <p className="text-muted-foreground">
                      Many projects offer stipends or other forms of compensation for your valuable contributions.
                    </p>
                  </div>
                </li>
              </ul>
              <Button className="mt-6" variant="outline" onClick={() => navigate("/signup")}>
                Join as a Student
              </Button>
            </div>
            
            {/* For Startups */}
            <div>
              <h2 className="text-2xl font-bold mb-6">For Startups</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-4 mt-1 bg-primary/20 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Access Fresh Talent</h3>
                    <p className="text-muted-foreground">
                      Connect with bright, motivated students who bring fresh perspectives and the latest skills.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 bg-primary/20 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Extend Your Resources</h3>
                    <p className="text-muted-foreground">
                      Complete important projects without the overhead of full-time hires or expensive agencies.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 bg-primary/20 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Find Future Team Members</h3>
                    <p className="text-muted-foreground">
                      Identify potential full-time team members by working with them on real projects first.
                    </p>
                  </div>
                </li>
              </ul>
              <Button className="mt-6" variant="outline" onClick={() => navigate("/signup")}>
                Join as a Startup
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Join our platform today and start connecting with innovative startups and talented students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-primary"
                onClick={() => navigate("/signup")}
              >
                Create Your Account
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10"
                onClick={() => navigate("/how-it-works")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">S-S Connect</h3>
              <p className="text-muted-foreground">
                Bridging the gap between student talent and startup innovation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/projects" className="text-muted-foreground hover:text-primary transition-colors">
                    Projects
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2023 Student-Startup Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
