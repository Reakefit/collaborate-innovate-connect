import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Project as ProjectType, Application as ApplicationType, Team as TeamType, ProjectCategory, PaymentModel, TeamRole, TeamMemberStatus, ApplicationStatus, ProjectStatus, ProjectMilestone, ProjectTask } from '@/types/database';
import { useAuth } from './AuthContext';

// Define context shape
interface ProjectContextType {
  projects: ProjectType[];
  teams: TeamType[];
  applications: ApplicationType[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  createProject: (project: Omit<ProjectType, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectType>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTeam: (team: Omit<TeamType, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTeam: (id: string, updates: Partial<TeamType>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  createMilestone: (milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMilestone: (id: string, updates: Partial<ProjectMilestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  createTask: (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getUserProjects: () => ProjectType[];
}

// Create context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Provider component
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;

      // Map data to the Project type
      const mappedProjects: ProjectType[] = data.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || "",
        category: project.category as ProjectCategory,
        start_date: project.start_date,
        end_date: project.end_date,
        payment_model: project.payment_model as PaymentModel,
        stipend_amount: project.stipend_amount || 0,
        required_skills: project.required_skills || [],
        team_size: project.team_size || 1,
        created_by: project.created_by,
        selected_team: project.selected_team || null,
        created_at: project.created_at,
        updated_at: project.updated_at,
        status: project.status as ProjectStatus,
        deliverables: project.deliverables || []
      }));

      setProjects(mappedProjects);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team data
  const fetchTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
        *,
        members:team_members(
          *,
          user:profiles(name)
        )
      `);

      if (error) throw error;

      // Map data to the Team type
      const mappedTeams: TeamType[] = data.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description || "",
        lead_id: team.lead_id,
        skills: team.skills || [],
        portfolio_url: team.portfolio_url || null,
        achievements: team.achievements || null,
        members: team.members?.map(member => ({
          id: member.id,
          team_id: member.team_id,
          user_id: member.user_id,
          role: member.role as TeamRole,
          status: member.status as TeamMemberStatus,
          joined_at: member.joined_at,
          user: {
            name: member.user?.name || ""
          }
        })) || [],
        created_at: team.created_at,
        updated_at: team.updated_at
      }));

      setTeams(mappedTeams);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  // Fetch application data
  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          team:teams(
            *,
            members:team_members(
              *,
              user:profiles(name)
            )
          ),
          project:projects(*)
        `);

      if (error) throw error;

      // Map data to the Application type
      const mappedApplications: ApplicationType[] = data.map(application => ({
        id: application.id,
        project_id: application.project_id,
        team_id: application.team_id,
        user_id: application.user_id,
        cover_letter: application.cover_letter,
        status: application.status as ApplicationStatus,
        created_at: application.created_at,
        updated_at: application.updated_at,
        team: application.team ? {
          id: application.team.id,
          name: application.team.name,
          description: application.team.description || "",
          lead_id: application.team.lead_id,
          skills: application.team.skills || [],
          portfolio_url: application.team.portfolio_url || null,
          achievements: application.team.achievements || null,
          members: application.team.members?.map(member => ({
            id: member.id,
            team_id: member.team_id,
            user_id: member.user_id,
            role: member.role as TeamRole,
            status: member.status as TeamMemberStatus,
            joined_at: member.joined_at,
            user: {
              name: member.user?.name || ""
            }
          })) || [],
          created_at: application.team.created_at,
          updated_at: application.team.updated_at
        } : undefined,
        project: application.project ? {
          id: application.project.id,
          title: application.project.title,
          description: application.project.description || "",
          category: application.project.category as ProjectCategory,
          start_date: application.project.start_date,
          end_date: application.project.end_date,
          payment_model: application.project.payment_model as PaymentModel,
          stipend_amount: application.project.stipend_amount || 0,
          required_skills: application.project.required_skills || [],
          team_size: application.project.team_size || 1,
          created_by: application.project.created_by,
          selected_team: application.project.selected_team || null,
          created_at: application.project.created_at,
          updated_at: application.project.updated_at,
          status: application.project.status as ProjectStatus,
          deliverables: application.project.deliverables || []
        } : undefined
      }));

      setApplications(mappedApplications);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  // Create project
  const createProject = async (project: Omit<ProjectType, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setProjects(prevProjects => [...prevProjects, data]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update project
  const updateProject = async (id: string, updates: Partial<ProjectType>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prevProjects =>
        prevProjects.map(project => (project.id === id ? { ...project, ...data } : project))
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create team
  const createTeam = async (team: Omit<TeamType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();

      if (error) throw error;

      setTeams(prevTeams => [...prevTeams, data]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update team
  const updateTeam = async (id: string, updates: Partial<TeamType>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTeams(prevTeams =>
        prevTeams.map(team => (team.id === id ? { ...team, ...data } : team))
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete team
  const deleteTeam = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeams(prevTeams => prevTeams.filter(team => team.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply to project
  const applyToProject = async (projectId: string, teamId: string, coverLetter: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          team_id: teamId,
          user_id: user.id,
          cover_letter: coverLetter,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setApplications(prevApplications => [...prevApplications, data]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      setApplications(prevApplications =>
        prevApplications.map(application =>
          application.id === applicationId ? { ...application, status } : application
        )
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create milestone
  const createMilestone = async (milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_milestones')
        .insert(milestone)
        .select()
        .single();

      if (error) throw error;

      // Update the projects state with the new milestone
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.id === milestone.project_id) {
            return {
              ...project,
              milestones: [...(project.milestones || []), data]
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update milestone
  const updateMilestone = async (id: string, updates: Partial<ProjectMilestone>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update the projects state with the updated milestone
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.milestones && project.milestones.some(milestone => milestone.id === id)) {
            return {
              ...project,
              milestones: project.milestones.map(milestone =>
                milestone.id === id ? { ...milestone, ...data } : milestone
              )
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete milestone
  const deleteMilestone = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the projects state by removing the deleted milestone
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.milestones && project.milestones.some(milestone => milestone.id === id)) {
            return {
              ...project,
              milestones: project.milestones.filter(milestone => milestone.id !== id)
            };
          }
          return project;
        })
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;

      // Update the projects state with the new task
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.milestones && project.milestones.some(milestone => milestone.id === task.milestone_id)) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => {
                if (milestone.id === task.milestone_id) {
                  return {
                    ...milestone,
                    tasks: [...(milestone.tasks || []), data]
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (id: string, updates: Partial<ProjectTask>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update the projects state with the updated task
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.milestones) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => {
                if (milestone.tasks && milestone.tasks.some(task => task.id === id)) {
                  return {
                    ...milestone,
                    tasks: milestone.tasks.map(task =>
                      task.id === id ? { ...task, ...data } : task
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the projects state by removing the deleted task
      setProjects(prevProjects =>
        prevProjects.map(project => {
          if (project.milestones) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => {
                if (milestone.tasks && milestone.tasks.some(task => task.id === id)) {
                  return {
                    ...milestone,
                    tasks: milestone.tasks.filter(task => task.id !== id)
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user projects
  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(project => project.created_by === user.id);
  };

  useEffect(() => {
    fetchProjects();
    fetchTeams();
    fetchApplications();
  }, [fetchProjects, fetchTeams, fetchApplications]);

  const value: ProjectContextType = {
    projects,
    teams,
    applications,
    loading,
    error,
    fetchProjects,
    fetchTeams,
    fetchApplications,
    createProject,
    updateProject,
    deleteProject,
    createTeam,
    updateTeam,
    deleteTeam,
    applyToProject,
    updateApplicationStatus,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createTask,
    updateTask,
    deleteTask,
    getUserProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook for using the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
