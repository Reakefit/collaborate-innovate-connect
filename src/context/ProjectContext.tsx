
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useAuth, UserProfile } from "./AuthContext";

export type ProjectCategory = 
  | "MVP Development" 
  | "Market Research" 
  | "GTM Strategy" 
  | "Design" 
  | "Content Creation"
  | "Social Media"
  | "Data Analysis"
  | "Other";

export type PaymentModel = 
  | "Pro-bono" 
  | "Stipend" 
  | "Equity" 
  | "Certificate";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  deliverables: string[];
  timeline: {
    startDate: Date;
    endDate: Date;
  };
  paymentModel: PaymentModel;
  stipendAmount?: number;
  requiredSkills: string[];
  teamSize: number;
  status: "open" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    companyName?: string;
  };
  applications: ProjectApplication[];
  selectedTeam?: string;
  milestones: ProjectMilestone[];
}

export interface ProjectApplication {
  id: string;
  projectId: string;
  teamId?: string;
  teamName?: string;
  teamLead?: string;
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed" | "overdue";
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    assignedTo?: string;
  }[];
}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  members: {
    id: string;
    name: string;
    email: string;
    role?: string;
  }[];
  projects: string[]; // Project IDs
  rating?: number;
  reviews?: {
    id: string;
    projectId: string;
    reviewerId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

interface ProjectContextType {
  projects: Project[];
  teams: Team[];
  messages: Record<string, Message[]>; // projectId -> messages
  userApplications: ProjectApplication[];
  createProject: (project: Omit<Project, "id" | "createdAt" | "applications" | "status" | "milestones">) => Promise<void>;
  applyToProject: (
    projectId: string, 
    application: Omit<ProjectApplication, "id" | "projectId" | "createdAt" | "status">
  ) => Promise<void>;
  updateProjectStatus: (projectId: string, status: Project["status"]) => Promise<void>;
  selectTeam: (projectId: string, teamId: string) => Promise<void>;
  createMilestone: (projectId: string, milestone: Omit<ProjectMilestone, "id">) => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, update: Partial<ProjectMilestone>) => Promise<void>;
  sendMessage: (projectId: string, content: string) => Promise<void>;
  rateProject: (projectId: string, rating: number, comment: string) => Promise<void>;
  getUserProjects: () => Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [userApplications, setUserApplications] = useState<ProjectApplication[]>([]);

  // Load data on initial render
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    const storedTeams = localStorage.getItem("teams");
    const storedMessages = localStorage.getItem("messages");
    
    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedTeams) setTeams(JSON.parse(storedTeams));
    if (storedMessages) setMessages(JSON.parse(storedMessages));
    
    // Load user applications if user is logged in
    if (user) {
      const applications = projects
        .flatMap(p => p.applications)
        .filter(app => 
          app.members.some(m => m.id === user.id) || 
          app.teamLead === user.id
        );
      setUserApplications(applications);
    }
  }, [user, projects]);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const createProject = async (
    project: Omit<Project, "id" | "createdAt" | "applications" | "status" | "milestones">
  ) => {
    if (!user) throw new Error("You must be logged in to create a project");
    if (user.role !== "startup") throw new Error("Only startups can create projects");

    const newProject: Project = {
      ...project,
      id: `project_${Date.now()}`,
      createdAt: new Date(),
      status: "open",
      applications: [],
      milestones: [],
      createdBy: {
        id: user.id,
        name: user.name,
        companyName: user.companyName
      }
    };

    setProjects(prev => [...prev, newProject]);
    toast.success("Project created successfully");
  };

  const applyToProject = async (
    projectId: string, 
    application: Omit<ProjectApplication, "id" | "projectId" | "createdAt" | "status">
  ) => {
    if (!user) throw new Error("You must be logged in to apply to a project");
    if (user.role !== "student") throw new Error("Only students can apply to projects");

    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    if (project.status !== "open") throw new Error("This project is not accepting applications");

    // Check if user has already applied to this project
    const alreadyApplied = project.applications.some(app => 
      app.members.some(m => m.id === user.id) ||
      app.teamLead === user.id
    );
    if (alreadyApplied) throw new Error("You have already applied to this project");

    const newApplication: ProjectApplication = {
      ...application,
      id: `application_${Date.now()}`,
      projectId,
      createdAt: new Date(),
      status: "pending"
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          applications: [...p.applications, newApplication]
        };
      }
      return p;
    }));

    // If it's a team application, create or update the team
    if (application.teamName && application.members.length > 1) {
      const existingTeam = teams.find(t => 
        t.name === application.teamName && 
        t.leadId === (application.teamLead || user.id)
      );

      if (existingTeam) {
        // Update existing team
        setTeams(prev => prev.map(t => {
          if (t.id === existingTeam.id) {
            return {
              ...t,
              members: application.members,
              projects: [...t.projects, projectId]
            };
          }
          return t;
        }));
      } else {
        // Create new team
        const newTeam: Team = {
          id: `team_${Date.now()}`,
          name: application.teamName,
          leadId: application.teamLead || user.id,
          members: application.members,
          projects: [projectId]
        };
        setTeams(prev => [...prev, newTeam]);
      }
    }

    toast.success("Application submitted successfully");
  };

  const updateProjectStatus = async (projectId: string, status: Project["status"]) => {
    if (!user) throw new Error("You must be logged in to update a project");

    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");

    // Check if user is the creator of the project or is part of the selected team
    const isCreator = project.createdBy.id === user.id;
    const isTeamMember = project.selectedTeam && 
      teams.find(t => t.id === project.selectedTeam)?.members.some(m => m.id === user.id);

    if (!isCreator && !isTeamMember) {
      throw new Error("You don't have permission to update this project");
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, status };
      }
      return p;
    }));

    toast.success(`Project status updated to ${status}`);
  };

  const selectTeam = async (projectId: string, teamId: string) => {
    if (!user) throw new Error("You must be logged in to select a team");
    
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    
    if (project.createdBy.id !== user.id) {
      throw new Error("Only the project creator can select a team");
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");

    // Update project with selected team
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        // Update application statuses
        const updatedApplications = p.applications.map(app => ({
          ...app,
          status: app.teamId === teamId ? "accepted" : "rejected"
        }));

        return { 
          ...p, 
          selectedTeam: teamId,
          status: "in-progress",
          applications: updatedApplications
        };
      }
      return p;
    }));

    toast.success("Team selected successfully");
  };

  const createMilestone = async (projectId: string, milestone: Omit<ProjectMilestone, "id">) => {
    if (!user) throw new Error("You must be logged in to create a milestone");
    
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    
    if (project.createdBy.id !== user.id) {
      throw new Error("Only the project creator can add milestones");
    }

    const newMilestone: ProjectMilestone = {
      ...milestone,
      id: `milestone_${Date.now()}`
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          milestones: [...p.milestones, newMilestone]
        };
      }
      return p;
    }));

    toast.success("Milestone added successfully");
  };

  const updateMilestone = async (
    projectId: string, 
    milestoneId: string, 
    update: Partial<ProjectMilestone>
  ) => {
    if (!user) throw new Error("You must be logged in to update a milestone");
    
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    
    // Check permissions
    const isCreator = project.createdBy.id === user.id;
    const isTeamMember = project.selectedTeam && 
      teams.find(t => t.id === project.selectedTeam)?.members.some(m => m.id === user.id);

    if (!isCreator && !isTeamMember) {
      throw new Error("You don't have permission to update this milestone");
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedMilestones = p.milestones.map(m => {
          if (m.id === milestoneId) {
            return { ...m, ...update };
          }
          return m;
        });

        return { ...p, milestones: updatedMilestones };
      }
      return p;
    }));

    toast.success("Milestone updated successfully");
  };

  const sendMessage = async (projectId: string, content: string) => {
    if (!user) throw new Error("You must be logged in to send a message");
    
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    
    // Check if user is involved in this project
    const isCreator = project.createdBy.id === user.id;
    const isTeamMember = project.selectedTeam && 
      teams.find(t => t.id === project.selectedTeam)?.members.some(m => m.id === user.id);
    const isApplicant = project.applications.some(app => 
      app.members.some(m => m.id === user.id) || app.teamLead === user.id
    );

    if (!isCreator && !isTeamMember && !isApplicant) {
      throw new Error("You don't have permission to send messages in this project");
    }

    const newMessage: Message = {
      id: `message_${Date.now()}`,
      projectId,
      senderId: user.id,
      senderName: user.name,
      content,
      createdAt: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newMessage]
    }));

    return Promise.resolve();
  };

  const rateProject = async (projectId: string, rating: number, comment: string) => {
    if (!user) throw new Error("You must be logged in to rate a project");
    
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    
    if (project.status !== "completed") {
      throw new Error("Only completed projects can be rated");
    }

    // For now, we're just mocking this functionality
    toast.success("Project rated successfully");
    return Promise.resolve();
  };

  const getUserProjects = () => {
    if (!user) return [];

    if (user.role === "startup") {
      return projects.filter(p => p.createdBy.id === user.id);
    } else {
      return projects.filter(p => 
        (p.selectedTeam && 
         teams.find(t => t.id === p.selectedTeam)?.members.some(m => m.id === user.id)) ||
        p.applications.some(app => 
          app.members.some(m => m.id === user.id) || 
          app.teamLead === user.id
        )
      );
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        teams,
        messages,
        userApplications,
        createProject,
        applyToProject,
        updateProjectStatus,
        selectTeam,
        createMilestone,
        updateMilestone,
        sendMessage,
        rateProject,
        getUserProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
