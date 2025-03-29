import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { 
  Project, Team, Application, ProjectMilestone, ProjectTask, 
  ProjectMessage, ProjectReview, ProjectNotification, TeamTask, 
  TeamMessage, ApplicationStatus, ProjectStatus, MilestoneStatus, 
  TaskStatus, TeamTaskStatus
} from '@/types/database';

// Re-export types for use in other components
export { 
  Project, Team, Application, ProjectMilestone, ProjectTask, 
  ProjectMessage as Message, ProjectReview, ProjectNotification, 
  TeamTask, TeamMessage, ApplicationStatus, ProjectStatus, 
  MilestoneStatus, TaskStatus, TeamTaskStatus
};

interface ProjectContextType {
  projects: Project[];
  teams: Team[];
  userApplications: Application[];
  applications: Application[];
  loading: boolean;
  error: string;
  createProject: (project: Omit<Project, "id" | "created_at" | "updated_at" | "selected_team">) => Promise<Project>;
  updateProject: (projectId: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProject: (projectId: string) => Project | undefined;
  getUserProjects: () => Project[];
  fetchProjects: () => Promise<void>;
  fetchUserTeams: () => Promise<void>;
  createTeam: (team: Omit<Team, "id" | "created_at" | "updated_at">) => Promise<Team>;
  updateTeam: (teamId: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  getTeam: (teamId: string) => Team | undefined;
  joinTeam: (teamId: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  createApplication: (application: Omit<Application, "id" | "created_at" | "updated_at">) => Promise<Application>;
  updateApplication: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  deleteApplication: (applicationId: string) => Promise<void>;
  getApplication: (applicationId: string) => Application | undefined;
  getProjectApplications: (projectId: string) => Application[];
  getUserApplications: () => Application[];
  createMilestone: (milestone: Omit<ProjectMilestone, "id" | "created_at" | "updated_at">) => Promise<ProjectMilestone>;
  updateMilestone: (milestoneId: string, milestone: Partial<ProjectMilestone>) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  getMilestone: (milestoneId: string) => ProjectMilestone | undefined;
  getProjectMilestones: (projectId: string) => ProjectMilestone[];
  createTask: (task: Omit<ProjectTask, "id" | "created_at" | "updated_at">) => Promise<ProjectTask>;
  updateTask: (taskId: string, task: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  getTask: (taskId: string) => ProjectTask | undefined;
  getProjectTasks: (projectId: string) => ProjectTask[];
  getMilestoneTasks: (milestoneId: string) => ProjectTask[];
  createNotification: (notification: Omit<ProjectNotification, "id" | "created_at">) => Promise<void>;
  getProjectAnalytics: (projectId: string) => Promise<any>;
}

// Create context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Provider component
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch projects and teams when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchUserTeams();
      fetchUserApplications();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data as Project[]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUserApplications(data as Application[]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');

      // Get teams where user is a member
      const { data: memberTeams, error: memberTeamsError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          status,
          teams:team_id (
            id,
            name,
            description,
            lead_id,
            skills,
            portfolio_url,
            achievements,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (memberTeamsError) {
        throw memberTeamsError;
      }

      // Get all teams with members
      const { data: allTeams, error: allTeamsError } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members (
            id,
            user_id,
            role,
            status,
            user:user_id (
              name
            )
          )
        `);

      if (allTeamsError) {
        throw allTeamsError;
      }

      // Process the teams
      const processedTeams: Team[] = allTeams.map((team: any) => ({
        ...team,
        members: team.members || []
      }));

      setTeams(processedTeams);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProject = (projectId: string) => {
    return projects.find(project => project.id === projectId);
  };

  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(project => project.created_by === user.id);
  };

  const getTeam = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  };

  const getApplication = (applicationId: string) => {
    return applications.find(application => application.id === applicationId);
  };

  const getProjectApplications = (projectId: string) => {
    return applications.filter(application => application.project_id === projectId);
  };

  const getUserApplications = () => {
    if (!user) return [];
    return userApplications.filter(application => application.user_id === user.id);
  };

  const getMilestone = (milestoneId: string) => {
    // Find the project that contains the milestone
    for (const project of projects) {
      const milestone = project.milestones?.find(milestone => milestone.id === milestoneId);
      if (milestone) {
        return milestone;
      }
    }
    return undefined;
  };

  const getProjectMilestones = (projectId: string) => {
    const project = projects.find(project => project.id === projectId);
    return project?.milestones || [];
  };

  const getTask = (taskId: string) => {
    // Iterate through projects and milestones to find the task
    for (const project of projects) {
      if (project.milestones) {
        for (const milestone of project.milestones) {
          const task = milestone.tasks?.find(task => task.id === taskId);
          if (task) {
            return task;
          }
        }
      }
    }
    return undefined;
  };

  const getProjectTasks = (projectId: string) => {
    let tasks: ProjectTask[] = [];
    // Iterate through milestones to collect tasks
    for (const project of projects) {
      if (project.id === projectId && project.milestones) {
        project.milestones.forEach(milestone => {
          if (milestone.tasks) {
            tasks = tasks.concat(milestone.tasks);
          }
        });
      }
    }
    return tasks;
  };

  const getMilestoneTasks = (milestoneId: string) => {
    // Find the project that contains the milestone
    for (const project of projects) {
      if (project.milestones) {
        for (const milestone of project.milestones) {
          if (milestone.id === milestoneId) {
            return milestone.tasks || [];
          }
        }
      }
    }
    return [];
  };

  const createProject = async (projectData: Omit<Project, "id" | "created_at" | "updated_at" | "selected_team">) => {
    if (!user) throw new Error('User must be logged in to create a project');
    
    try {
      setLoading(true);
      setError('');
      
      const newProject = {
        ...projectData,
        created_by: user.id,
        status: 'open' as ProjectStatus,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      
      if (error) throw error;
      
      setProjects(prev => [...prev, data as unknown as Project]);
      
      toast.success('Project created successfully');
      
      return data as unknown as Project;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to create project');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, projectData: Partial<Project>) => {
    if (!user) throw new Error('User must be logged in to update a project');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Update the projects state
      setProjects(prev => {
        return prev.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              ...projectData
            };
          }
          return project;
        });
      });
      
      toast.success('Project updated successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('User must be logged in to delete a project');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Update the projects state
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      toast.success('Project deleted successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestoneData: Omit<ProjectMilestone, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error('User must be logged in to create a milestone');
    
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({ 
          ...milestoneData,
          status: milestoneData.status || 'not_started',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update project with the new milestone
      setProjects(prev => {
        return prev.map(project => {
          if (project.id === milestoneData.project_id) {
            return {
              ...project,
              milestones: [...(project.milestones || []), data as unknown as ProjectMilestone]
            };
          }
          return project;
        });
      });
      
      toast.success('Milestone created successfully');
      
      return data as unknown as ProjectMilestone;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to create milestone');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (milestoneId: string, milestoneData: Partial<ProjectMilestone>) => {
    if (!user) throw new Error('User must be logged in to update a milestone');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('project_milestones')
        .update(milestoneData)
        .eq('id', milestoneId);
      
      if (error) throw error;
      
      // Update the milestones state
      setProjects(prev => {
        return prev.map(project => {
          if (project.milestones) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => {
                if (milestone.id === milestoneId) {
                  return {
                    ...milestone,
                    ...milestoneData
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        });
      });
      
      toast.success('Milestone updated successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to update milestone');
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!user) throw new Error('User must be logged in to delete a milestone');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);
      
      if (error) throw error;
      
      // Update the milestones state
      setProjects(prev => {
        return prev.map(project => {
          if (project.milestones) {
            return {
              ...project,
              milestones: project.milestones.filter(milestone => milestone.id !== milestoneId)
            };
          }
          return project;
        });
      });
      
      toast.success('Milestone deleted successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete milestone');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<ProjectTask, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error('User must be logged in to create a task');
    
    try {
      setLoading(true);
      setError('');
      
      // Ensure milestone_id is included if it's required by the database
      const taskToInsert = {
        ...taskData,
        status: taskData.status || 'not_started',
        created_by: user.id
      };
      
      const { data, error } = await supabase
        .from('project_tasks')
        .insert(taskToInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Task created successfully');
      
      return data as unknown as ProjectTask;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to create task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<ProjectTask>) => {
    if (!user) throw new Error('User must be logged in to update a task');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('project_tasks')
        .update(taskData)
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update the tasks state
      setProjects(prev => {
        return prev.map(project => {
          if (project.milestones) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => {
                if (milestone.tasks) {
                  return {
                    ...milestone,
                    tasks: milestone.tasks.map(task => {
                      if (task.id === taskId) {
                        return {
                          ...task,
                          ...taskData
                        };
                      }
                      return task;
                    })
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        });
      });
      
      toast.success('Task updated successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User must be logged in to delete a task');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update the tasks state
      setProjects(prev => {
        return prev.map(project => {
          if (project.milestones) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => {
                if (milestone.tasks) {
                  return {
                    ...milestone,
                    tasks: milestone.tasks.filter(task => task.id !== taskId)
                  };
                }
                return milestone;
              })
            };
          }
          return project;
        });
      });
      
      toast.success('Task deleted successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: Omit<Team, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error('User must be logged in to create a team');
    
    try {
      setLoading(true);
      setError('');
      
      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          lead_id: user.id
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Add the creator as a team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'lead' as TeamRole,
          status: 'active' as TeamMemberStatus
        });
      
      if (memberError) throw memberError;
      
      // Fetch all teams again to update the state
      await fetchUserTeams();
      
      toast.success('Team created successfully');
      
      return team as unknown as Team;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to create team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, teamData: Partial<Team>) => {
    if (!user) throw new Error('User must be logged in to update a team');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', teamId);
      
      if (error) throw error;
      
      // Update the teams state
      setTeams(prev => {
        return prev.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              ...teamData
            };
          }
          return team;
        });
      });
      
      toast.success('Team updated successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!user) throw new Error('User must be logged in to delete a team');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
      
      // Update the teams state
      setTeams(prev => prev.filter(team => team.id !== teamId));
      
      toast.success('Team deleted successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) throw new Error('User must be logged in to join a team');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member' as TeamRole,
          status: 'pending' as TeamMemberStatus
        });
      
      if (error) throw error;
      
      // Fetch all teams again to update the state
      await fetchUserTeams();
      
      toast.success('Request to join team submitted successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to request to join team');
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) throw new Error('User must be logged in to leave a team');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Fetch all teams again to update the state
      await fetchUserTeams();
      
      toast.success('Team left successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to leave team');
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: Omit<Application, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error('User must be logged in to create an application');
    
    try {
      setLoading(true);
      setError('');
      
      // Create the application
      const { data, error } = await supabase
        .from('applications')
        .insert({
          ...applicationData,
          user_id: user.id,
          status: 'pending' as ApplicationStatus
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the applications state
      setUserApplications(prev => [...prev, data as unknown as Application]);
      
      toast.success('Application submitted successfully');
      
      return data as unknown as Application;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to submit application');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (applicationId: string, status: ApplicationStatus) => {
    if (!user) throw new Error('User must be logged in to update an application');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Update the applications state
      setUserApplications(prev => {
        return prev.map(application => {
          if (application.id === applicationId) {
            return {
              ...application,
              status
            };
          }
          return application;
        });
      });
      
      toast.success('Application updated successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!user) throw new Error('User must be logged in to delete an application');
    
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Update the applications state
      setUserApplications(prev => prev.filter(application => application.id !== applicationId));
      
      toast.success('Application deleted successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: Omit<ProjectNotification, "id" | "created_at">) => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('project_notifications')
        .insert({
          ...notificationData,
          title: notificationData.title,
          content: notificationData.content,
          read: false
        });
      
      if (error) throw error;
      
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to create notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectAnalytics = async (projectId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Get project data
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');
      
      // Get milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from('project_milestones')
        .select(`
          *,
          tasks:project_tasks (*)
        `)
        .eq('project_id', projectId);
      
      if (milestonesError) throw milestonesError;
      
      // Calculate milestone completion
      const milestoneCompletion = milestones.map((milestone: any) => {
        const tasks = milestone.tasks || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
        const completion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return {
          id: milestone.id,
          title: milestone.title,
          status: milestone.status,
          completion,
          tasksCount: totalTasks,
          completedTasks
        };
      });
      
      // Calculate overall project completion
      const allTasks = milestones.flatMap((milestone: any) => milestone.tasks || []);
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((task: any) => task.status === 'completed').length;
      const overallCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      return {
        project,
        milestoneCompletion,
        overallCompletion,
        totalTasks,
        completedTasks,
        milestones
      };
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to get project analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        teams,
        userApplications,
        applications,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        getProject,
        getUserProjects,
        fetchProjects,
        fetchUserTeams,
        createTeam,
        updateTeam,
        deleteTeam,
        getTeam,
        joinTeam,
        leaveTeam,
        createApplication,
        updateApplication,
        deleteApplication,
        getApplication,
        getProjectApplications,
        getUserApplications,
        createMilestone,
        updateMilestone,
        deleteMilestone,
        getMilestone,
        getProjectMilestones,
        createTask,
        updateTask,
        deleteTask,
        getTask,
        getProjectTasks,
        getMilestoneTasks,
        createNotification,
        getProjectAnalytics
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Hook for using the context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
