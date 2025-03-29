import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Project, Application, Team, TeamMember, ProjectMilestone, ProjectTask,
  ProjectStatus, MilestoneStatus, TaskStatus, ApplicationStatus, ProjectResource
} from "@/types/database";

type ProjectContextType = {
  projects: Project[];
  applications: Application[];
  teams: Team[];
  tasks: ProjectTask[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  createProject: (projectData: Omit<Project, "id" | "created_at" | "updated_at" | "created_by">) => Promise<Project | undefined>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  createTeam: (teamData: Omit<Team, "id" | "created_at" | "updated_at">) => Promise<Team | undefined>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addTeamMember: (teamId: string, userEmail: string) => Promise<void>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  updateTeamMember: (teamId: string, memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  addMilestone: (projectId: string, milestoneData: Omit<ProjectMilestone, "id" | "created_at" | "updated_at" | "project_id">) => Promise<ProjectMilestone | undefined>;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => Promise<void>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  addTask: (projectId: string, milestoneId: string, taskData: Omit<ProjectTask, "id" | "created_at" | "updated_at" | "project_id" | "milestone_id">) => Promise<ProjectTask | undefined>;
  updateTask: (projectId: string, milestoneId: string, taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (projectId: string, milestoneId: string, taskId: string) => Promise<void>;
  updateTaskStatus: (projectId: string, milestoneId: string, taskId: string, status: TaskStatus) => Promise<void>;
  fetchProject: (projectId: string) => Promise<Project | null>;
};

export const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProject = async (projectId: string): Promise<Project | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const typedProject: Project = {
          ...data,
          status: data.status as ProjectStatus,
          updated_at: data.updated_at || new Date().toISOString(),
          deliverables: data.deliverables || [],
          required_skills: data.required_skills || []
        };
        return typedProject;
      }

      return null;
    } catch (error: any) {
      console.error("Error fetching project:", error.message);
      toast.error(error.message || "Error fetching project");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*");

      if (error) throw error;

      if (data) {
        const typedProjects: Project[] = data.map(item => ({
          ...item,
          status: item.status as ProjectStatus,
          updated_at: item.updated_at || new Date().toISOString(),
          deliverables: item.deliverables || [],
          required_skills: item.required_skills || []
        }));
        setProjects(typedProjects);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
      toast.error(error.message || "Error fetching projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          team:teams(*)
        `);

      if (error) throw error;

      if (data) {
        setApplications(data as Application[]);
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error.message);
      toast.error(error.message || "Error fetching applications");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData: Omit<Project, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const newProject = {
        ...projectData,
        created_by: user.id,
        status: projectData.status || "open" as ProjectStatus
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;

      const typedProject: Project = {
        ...data,
        updated_at: data.updated_at || new Date().toISOString(),
        status: data.status as ProjectStatus
      };

      setProjects(prevProjects => [...prevProjects, typedProject]);
      return typedProject;
    } catch (error: any) {
      console.error("Error creating project:", error.message);
      toast.error(error.message || "Error creating project");
      throw error;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId);

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, ...updates } : project
        )
      );
    } catch (error: any) {
      console.error("Error updating project:", error.message);
      toast.error(error.message || "Error updating project");
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    } catch (error: any) {
      console.error("Error deleting project:", error.message);
      toast.error(error.message || "Error deleting project");
      throw error;
    }
  };

  const applyToProject = async (projectId: string, teamId: string, coverLetter: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("applications")
        .insert({
          project_id: projectId,
          team_id: teamId,
          user_id: user.id,
          cover_letter: coverLetter,
          status: "pending"
        });

      if (error) throw error;

      await fetchApplications();
    } catch (error: any) {
      console.error("Error applying to project:", error.message);
      toast.error(error.message || "Error applying to project");
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status } 
            : app
        )
      );

      toast.success(`Application ${status} successfully`);
    } catch (error: any) {
      console.error("Error updating application:", error.message);
      toast.error(error.message || "Error updating application status");
      throw error;
    }
  };

  const createTeam = async (teamData: Omit<Team, "id" | "created_at" | "updated_at">) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const newTeam = {
        ...teamData,
        lead_id: user.id
      };

      const { data, error } = await supabase
        .from("teams")
        .insert(newTeam)
        .select()
        .single();

      if (error) throw error;

      setTeams(prevTeams => [...prevTeams, data as Team]);
      return data as Team;
    } catch (error: any) {
      console.error("Error creating team:", error.message);
      toast.error(error.message || "Error creating team");
      throw error;
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("teams")
        .update(updates)
        .eq("id", teamId);

      if (error) throw error;

      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === teamId ? { ...team, ...updates } : team
        )
      );
    } catch (error: any) {
      console.error("Error updating team:", error.message);
      toast.error(error.message || "Error updating team");
      throw error;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;

      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
    } catch (error: any) {
      console.error("Error deleting team:", error.message);
      toast.error(error.message || "Error deleting team");
      throw error;
    }
  };

  const addTeamMember = async (teamId: string, userEmail: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      // Fetch the user ID based on the provided email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError) throw userError;

      if (!userData) {
        toast.error("User with this email not found");
        return;
      }

      const { error } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          user_id: userData.id,
          role: "member",
          status: "invited"
        });

      if (error) throw error;

      await fetchTeams();
    } catch (error: any) {
      console.error("Error adding team member:", error.message);
      toast.error(error.message || "Error adding team member");
      throw error;
    }
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (error) throw error;

      await fetchTeams();
    } catch (error: any) {
      console.error("Error removing team member:", error.message);
      toast.error(error.message || "Error removing team member");
      throw error;
    }
  };

  const updateTeamMember = async (teamId: string, memberId: string, updates: Partial<TeamMember>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("team_members")
        .update(updates)
        .eq("id", memberId);

      if (error) throw error;

      await fetchTeams();
    } catch (error: any) {
      console.error("Error updating team member:", error.message);
      toast.error(error.message || "Error updating team member");
      throw error;
    }
  };

  const addMilestone = async (
    projectId: string,
    milestoneData: Omit<ProjectMilestone, "id" | "created_at" | "updated_at" | "project_id">
  ) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("milestones")
        .insert({
          ...milestoneData,
          project_id: projectId,
          status: milestoneData.status || "not_started" as MilestoneStatus
        })
        .select()
        .single();

      if (error) throw error;

      const newMilestone: ProjectMilestone = {
        ...data,
        status: data.status as MilestoneStatus,
        updated_at: data.updated_at || new Date().toISOString()
      };

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: [...milestones, newMilestone]
            };
          }
          return project;
        })
      );

      return newMilestone;
    } catch (error: any) {
      console.error("Error adding milestone:", error.message);
      toast.error(error.message || "Error adding milestone");
      throw error;
    }
  };

  const updateMilestone = async (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("milestones")
        .update(updates)
        .eq("id", milestoneId);

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: milestones.map(milestone =>
                milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
              )
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      console.error("Error updating milestone:", error.message);
      toast.error(error.message || "Error updating milestone");
      throw error;
    }
  };

  const deleteMilestone = async (projectId: string, milestoneId: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: milestones.filter(milestone => milestone.id !== milestoneId)
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      console.error("Error deleting milestone:", error.message);
      toast.error(error.message || "Error deleting milestone");
      throw error;
    }
  };

  const addTask = async (
    projectId: string,
    milestoneId: string,
    taskData: Omit<ProjectTask, "id" | "created_at" | "updated_at" | "project_id" | "milestone_id">
  ) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          project_id: projectId,
          milestone_id: milestoneId,
          status: taskData.status || "todo" as TaskStatus,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: ProjectTask = {
        ...data,
        status: data.status as TaskStatus,
        updated_at: data.updated_at || new Date().toISOString()
      };

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: milestones.map(milestone => {
                if (milestone.id === milestoneId) {
                  const tasks = milestone.tasks || [];
                  return {
                    ...milestone,
                    tasks: [...tasks, newTask]
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        })
      );

      return newTask;
    } catch (error: any) {
      console.error("Error adding task:", error.message);
      toast.error(error.message || "Error adding task");
      throw error;
    }
  };

  const updateTask = async (projectId: string, milestoneId: string, taskId: string, updates: Partial<ProjectTask>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: milestones.map(milestone => {
                if (milestone.id === milestoneId) {
                  const tasks = milestone.tasks || [];
                  return {
                    ...milestone,
                    tasks: tasks.map(task =>
                      task.id === taskId ? { ...task, ...updates } : task
                    )
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      console.error("Error updating task:", error.message);
      toast.error(error.message || "Error updating task");
      throw error;
    }
  };

  const deleteTask = async (projectId: string, milestoneId: string, taskId: string) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: milestones.map(milestone => {
                if (milestone.id === milestoneId) {
                  const tasks = milestone.tasks || [];
                  return {
                    ...milestone,
                    tasks: tasks.filter(task => task.id !== taskId)
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      console.error("Error deleting task:", error.message);
      toast.error(error.message || "Error deleting task");
      throw error;
    }
  };

  const updateTaskStatus = async (projectId: string, milestoneId: string, taskId: string, status: TaskStatus) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === projectId) {
            const milestones = project.milestones || [];
            return {
              ...project,
              milestones: milestones.map(milestone => {
                if (milestone.id === milestoneId) {
                  const tasks = milestone.tasks || [];
                  return {
                    ...milestone,
                    tasks: tasks.map(task =>
                      task.id === taskId ? { ...task, status } : task
                    )
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      console.error("Error updating task status:", error.message);
      toast.error(error.message || "Error updating task status");
      throw error;
    }
  };

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          members:team_members(
            *,
            user:profiles(name)
          )
        `);

      if (error) throw error;

      if (data) {
        setTeams(data as Team[]);
      }
    } catch (error: any) {
      console.error("Error fetching teams:", error.message);
      toast.error(error.message || "Error fetching teams");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        applications,
        teams,
        tasks,
        loading,
        fetchProjects,
        fetchApplications,
        fetchTeams,
        createProject,
        updateProject,
        deleteProject,
        applyToProject,
        updateApplicationStatus,
        createTeam,
        updateTeam,
        deleteTeam,
        addTeamMember,
        removeTeamMember,
        updateTeamMember,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        fetchProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProjectContext() {
  return useContext(ProjectContext);
}
