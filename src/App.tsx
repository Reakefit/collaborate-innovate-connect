
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthorizationProvider } from "./context/AuthorizationContext";
import { ProjectProvider } from "./context/ProjectContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignInStudent from "./pages/SignInStudent";
import SignInStartup from "./pages/SignInStartup";
import SignUp from "./pages/SignUp";
import SignUpStudent from "./pages/SignUpStudent";
import SignUpStartup from "./pages/SignUpStartup";
import CompleteProfile from "./pages/CompleteProfile";
import VerifyCollege from "./pages/VerifyCollege";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import Profile from "./pages/Profile";
import Teams from "./pages/Teams";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import TeamPage from '@/pages/TeamPage';
import HowItWorks from './pages/HowItWorks';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthorizationProvider>
            <ProjectProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signin/student" element={<SignInStudent />} />
                  <Route path="/signin/startup" element={<SignInStartup />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signup/student" element={<SignUpStudent />} />
                  <Route path="/signup/startup" element={<SignUpStartup />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/verify-college" element={<VerifyCollege />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/create-project" element={<CreateProject />} />
                  <Route path="/project/:projectId" element={<ProjectPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/teams/:teamId" element={<TeamPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProjectProvider>
          </AuthorizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
