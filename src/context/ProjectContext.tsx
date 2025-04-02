
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { 
  Project, Application, ProjectCategory, ApplicationStatus, ProjectStatus,
  Team, TeamTask, TeamMember, ProjectMilestone, MilestoneStatus, TaskStatus, 
  ProjectTask, TeamTaskStatus, PaymentModel, Json, TeamMemberRole, TeamMemberStatus
} from '@/types/database';
import { toast } from 'sonner';
import { fetchApplicationsWithTeams } from '@/services/database';
import { debugLog, debugError, logSupabaseOperation } from '@/utils/debug';
import { 
  createProject, updateProject, deleteProject, updateProjectStatus,
  fetchProjects, fetchProject 
} from '@/services/projectService';
import {
  createTeam, updateTeam, deleteTeam, joinTeam, leaveTeam,
  fetchTeam, fetchTeams, fetchUserTeams 
} from '@/services/teamService';
import {
  fetchTeamTasks, createTeamTask, updateTeamTask, deleteTeamTask
} from '@/services/taskService';
import {
  addTask, updateTaskStatus, addMilestone
} from '@/services/milestoneService';
import {
  applyToProject, fetchApplications, updateApplicationStatus
} from '@/services/applicationService';

interface ProjectContextType {
  projects: Project[];
  applications: Application[];
  teams: Team[];
  loading: boolean;
  error: string | null;
  fetchProject: (id: string) => Promise<Project | null>;
  fetchProjects: () => Promise<void>;
  createProject: (projectData: any) => Promise<Project | null>;
  updateProject: (id: string, projectData: any) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  getUserProjects: () => Project[];
  updateProjectStatus: (id: string, status: string) => Promise<boolean>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<boolean>;
  createTeam: (teamData: any) => Promise<Team | null>;
  updateTeam: (id: string, teamData: any) => Promise<boolean>;
  deleteTeam: (id: string) => Promise<boolean>;
  joinTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  fetchTeam: (id: string) => Promise<Team | null>;
  fetchTeams: () => Promise<void>;
  fetchUserTeams: () => Promise<Team[]>;
  fetchTeamTasks: (teamId: string) => Promise<TeamTask[]>;
  createTeamTask: (teamId: string, taskData: any) => Promise<TeamTask | null>;
  updateTeamTask: (teamId: string, taskId: string, taskData: any) => Promise<boolean>;
  deleteTeamTask: (teamId: string, taskId: string) => Promise<boolean>;
  fetchApplications: (projectId: string) => Promise<Application[]>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<boolean>;
  addTask: (projectId: string, milestoneId: string, taskData: any) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  addMilestone: (projectId: string, milestoneData: any) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  applications: [],
  teams: [],
  loading: false,
  error: null,
  fetchProject: async () => null,
  fetchProjects: async () => {},
  createProject: async () => null,
  updateProject: async () => false,
  deleteProject: async () => false,
  getUserProjects: () => [],
  updateProjectStatus: async () => false,
  applyToProject: async () => false,
  createTeam: async () => null,
  updateTeam: async () => false,
  deleteTeam: async () => false,
  joinTeam: async () => false,
  leaveTeam: async () => false,
  fetchTeam: async () => null,
  fetchTeams: async () => {},
  fetchUserTeams: async () => [],
  fetchTeamTasks: async () => [],
  createTeamTask: async () => null,
  updateTeamTask: async () => false,
  deleteTeamTask: async () => false,
  fetchApplications: async () => [],
  updateApplicationStatus: async () => false,
  addTask: async () => false,
  updateTaskStatus: async () => false,
  addMilestone: async () => false,
});

// Create a hook for using the ProjectContext
export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchProjects(setProjects, setLoading, setError);
      fetchTeams(setTeams, setLoading, setError);
    }
  }, [user]);

  // Get projects created by the current user
  const getUserProjects = useCallback(() => {
    if (!user) return [];
    return projects.filter(project => project.created_by === user.id);
  }, [user, projects]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        applications,
        teams,
        loading,
        error,
        fetchProject: (id: string) => fetchProject(id, setLoading),
        fetchProjects: () => fetchProjects(setProjects, setLoading, setError),
        createProject: (projectData: any) => createProject(projectData, user, setProjects, setLoading, setError),
        updateProject: (id: string, projectData: any) => updateProject(id, projectData, setProjects, setLoading, setError),
        deleteProject: (id: string) => deleteProject(id, setProjects, setLoading, setError),
        getUserProjects,
        updateProjectStatus: (id: string, status: string) => updateProjectStatus(id, status, setProjects, setLoading, setError),
        applyToProject: (projectId: string, teamId: string, coverLetter: string) => 
          applyToProject(projectId, teamId, coverLetter, user, setApplications, setLoading, setError),
        createTeam: (teamData: any) => createTeam(teamData, user, setTeams, setLoading, setError),
        updateTeam: (id: string, teamData: any) => updateTeam(id, teamData, setTeams, setLoading, setError),
        deleteTeam: (id: string) => deleteTeam(id, setTeams, setLoading, setError),
        joinTeam: (teamId: string) => joinTeam(teamId, user, setTeams, setLoading, setError),
        leaveTeam: (teamId: string) => leaveTeam(teamId, user, setTeams, setLoading, setError),
        fetchTeam: (id: string) => fetchTeam(id, setLoading, setError),
        fetchTeams: () => fetchTeams(setTeams, setLoading, setError),
        fetchUserTeams: () => fetchUserTeams(user, setLoading, setError),
        fetchTeamTasks: (teamId: string) => fetchTeamTasks(teamId, setLoading, setError),
        createTeamTask: (teamId: string, taskData: any) => createTeamTask(teamId, taskData, user, setLoading, setError),
        updateTeamTask: (teamId: string, taskId: string, taskData: any) => 
          updateTeamTask(teamId, taskId, taskData, setLoading, setError),
        deleteTeamTask: (teamId: string, taskId: string) => deleteTeamTask(teamId, taskId, setLoading, setError),
        fetchApplications: (projectId: string) => fetchApplications(projectId, setLoading, setError),
        updateApplicationStatus: (applicationId: string, status: string) => 
          updateApplicationStatus(applicationId, status, setLoading, setError),
        addTask: (projectId: string, milestoneId: string, taskData: any) => 
          addTask(projectId, milestoneId, taskData, user, setLoading, setError),
        updateTaskStatus: (taskId: string, status: TaskStatus) => updateTaskStatus(taskId, status, setLoading, setError),
        addMilestone: (projectId: string, milestoneData: any) => addMilestone(projectId, milestoneData, setLoading, setError),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
