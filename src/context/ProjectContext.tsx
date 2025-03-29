
// Import only the necessary part to fix the import issue with 'default' binding
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Project, ProjectMilestone, ProjectTask, Application, 
  MilestoneStatus, TaskStatus, ProjectStatus, Team, TeamMember 
} from '@/types/database';
import { toast } from 'sonner';

interface ProjectContextType {
  projects: Project[];
  applications: Application[];
  teams: Team[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  createProject: (projectData: any) => Promise<Project>;
  fetchProject: (projectId: string) => Promise<Project | null>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  addTask: (projectId: string, milestoneId: string, taskData: any) => Promise<void>;
  addMilestone: (projectId: string, milestoneData: any) => Promise<void>;
  createTeam: (teamData: any) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  addTeamMember: (teamId: string, email: string) => Promise<void>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
  getUserProjects: () => Project[];
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  applications: [],
  teams: [],
  loading: false,
  fetchProjects: async () => {},
  fetchTeams: async () => {},
  createProject: async () => { throw new Error("createProject function not implemented."); },
  fetchProject: async () => null,
  applyToProject: async () => {},
  updateTaskStatus: async () => {},
  addTask: async () => {},
  addMilestone: async () => {},
  createTeam: async () => { throw new Error("createTeam function not implemented."); },
  deleteTeam: async () => {},
  addTeamMember: async () => {},
  removeTeamMember: async () => {},
  updateApplicationStatus: async () => {},
  getUserProjects: () => [],
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) {
        throw projectsError;
      }

      if (projectsData) {
        // Ensure each project has the required properties
        const typedProjects: Project[] = projectsData.map(project => ({
          ...project,
          required_skills: project.required_skills || [],
          deliverables: project.deliverables || [],
          milestones: [],
          resources: [],
          applications: [],
          updated_at: project.updated_at || project.created_at,
          status: project.status as ProjectStatus,
          payment_model: project.payment_model as any, // Cast to appropriate type
        }));
        
        setProjects(typedProjects);
      }

      // Fetch applications
      if (user) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*');

        if (applicationsError) {
          throw applicationsError;
        }

        if (applicationsData) {
          const typedApplications: Application[] = applicationsData.map(app => ({
            ...app,
            status: app.status as any,
          }));
          setApplications(typedApplications);
        } else {
          setApplications([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
      toast.error(error.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*, members:team_members(*, user:profiles(name))');

      if (teamsError) {
        throw teamsError;
      }

      if (teamsData) {
        const typedTeams: Team[] = teamsData.map(team => {
          const members = team.members ? team.members.map((member: any) => ({
            ...member,
            name: member.user?.name || '',
            role: member.role as any,
            status: member.status as any,
          })) : [];
          
          return {
            ...team,
            skills: team.skills || [],
            members,
          };
        });
        
        setTeams(typedTeams);
      } else {
        setTeams([]);
      }
    } catch (error: any) {
      console.error('Error fetching teams:', error.message);
      toast.error(error.message || 'Error fetching teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, [fetchProjects, fetchTeams]);

  const createProject = async (projectData: any): Promise<Project> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Ensure that project conforms to the Project type
        const newProject: Project = {
          ...data,
          required_skills: data.required_skills || [],
          deliverables: data.deliverables || [],
          milestones: [],
          resources: [],
          applications: [],
          updated_at: data.updated_at || data.created_at,
          status: data.status as ProjectStatus,
          payment_model: data.payment_model as any,
        };
        
        setProjects(prevProjects => [...prevProjects, newProject]);
        return newProject;
      } else {
        throw new Error("Project creation failed");
      }
    } catch (error: any) {
      console.error('Error creating project:', error.message);
      toast.error(error.message || 'Error creating project');
      throw error;
    }
  };

  const fetchProject = async (projectId: string): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones:project_milestones (
            *,
            tasks:project_tasks (*)
          )
        `)
        .eq('id', projectId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Ensure milestones and tasks conform to the right types
        const milestones = data.milestones?.map((milestone: any) => {
          return {
            ...milestone,
            status: milestone.status as MilestoneStatus,
            tasks: milestone.tasks?.map((task: any) => ({
              ...task,
              status: task.status as TaskStatus,
              completed: Boolean(task.completed),
            })) || [],
          };
        }) || [];
        
        // Create a properly typed Project object
        const typedProject: Project = {
          ...data,
          milestones,
          resources: [],
          applications: [],
          required_skills: data.required_skills || [],
          deliverables: data.deliverables || [],
          updated_at: data.updated_at || data.created_at,
          status: data.status as ProjectStatus,
          payment_model: data.payment_model as any,
        };
        
        return typedProject;
      } else {
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching project:', error.message);
      toast.error(error.message || 'Error fetching project');
      return null;
    }
  };

  const applyToProject = async (projectId: string, teamId: string, coverLetter: string) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            project_id: projectId,
            team_id: teamId,
            user_id: user.id,
            cover_letter: coverLetter,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newApplication: Application = {
          ...data,
          status: data.status as any,
          team: teams.find(t => t.id === teamId),
        };
        
        setApplications(prevApplications => [...prevApplications, newApplication]);
        toast.success("Application submitted successfully!");
      }
    } catch (error: any) {
      console.error("Error applying to project:", error.message);
      toast.error(error.message || "Error applying to project");
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistically update the task status in the local state
      setProjects(prevProjects =>
        prevProjects.map(project => ({
          ...project,
          milestones: project.milestones?.map(milestone => ({
            ...milestone,
            tasks: milestone.tasks?.map(task =>
              task.id === taskId ? { ...task, status } : task
            ) || []
          })) || []
        }))
      );
    } catch (error: any) {
      console.error("Error updating task status:", error.message);
      toast.error(error.message || "Error updating task status");
    }
  };

  const addTask = async (projectId: string, milestoneId: string, taskData: any) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([{ ...taskData, project_id: projectId, milestone_id: milestoneId }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newTask: ProjectTask = {
          ...data,
          status: data.status as TaskStatus,
          completed: Boolean(data.completed),
        };
        
        // Optimistically update the tasks in the local state
        setProjects(prevProjects =>
          prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                milestones: project.milestones?.map(milestone => {
                  if (milestone.id === milestoneId) {
                    return {
                      ...milestone,
                      tasks: [...(milestone.tasks || []), newTask]
                    };
                  }
                  return milestone;
                }) || []
              };
            }
            return project;
          })
        );
      }
    } catch (error: any) {
      console.error("Error adding task:", error.message);
      toast.error(error.message || "Error adding task");
    }
  };

  const addMilestone = async (projectId: string, milestoneData: any) => {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert([{ ...milestoneData, project_id: projectId }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newMilestone: ProjectMilestone = {
          ...data,
          status: data.status as MilestoneStatus,
          tasks: [],
        };
        
        // Optimistically update the milestones in the local state
        setProjects(prevProjects =>
          prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                milestones: [...(project.milestones || []), newMilestone]
              };
            }
            return project;
          })
        );
      }
    } catch (error: any) {
      console.error("Error adding milestone:", error.message);
      toast.error(error.message || "Error adding milestone");
    }
  };

  // Team-related functions
  const createTeam = async (teamData: any): Promise<Team> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newTeam: Team = {
          ...data,
          skills: data.skills || [],
          members: [],
        };
        
        setTeams(prevTeams => [...prevTeams, newTeam]);
        return newTeam;
      } else {
        throw new Error("Team creation failed");
      }
    } catch (error: any) {
      console.error('Error creating team:', error.message);
      toast.error(error.message || 'Error creating team');
      throw error;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (error) throw error;
      
      // Update local state
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      toast.success("Team deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting team:", error.message);
      toast.error(error.message || "Error deleting team");
    }
  };

  const addTeamMember = async (teamId: string, email: string) => {
    try {
      // First get the user id from the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (userError) throw new Error("User not found with that email");
      
      if (userData) {
        const { data, error } = await supabase
          .from('team_members')
          .insert([{
            team_id: teamId,
            user_id: userData.id,
            role: 'member',
            status: 'invited'
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Update local state
          setTeams(prevTeams => 
            prevTeams.map(team => {
              if (team.id === teamId) {
                const newMember: TeamMember = {
                  ...data,
                  name: email.split('@')[0],  // Use part of email as name until profile is loaded
                  role: data.role as any,
                  status: data.status as any,
                };
                return {
                  ...team,
                  members: [...(team.members || []), newMember]
                };
              }
              return team;
            })
          );
          toast.success("Team member invited successfully!");
        }
      }
    } catch (error: any) {
      console.error("Error adding team member:", error.message);
      toast.error(error.message || "Error adding team member");
    }
  };

  const removeTeamMember = async (teamId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      // Update local state
      setTeams(prevTeams => 
        prevTeams.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              members: team.members?.filter(member => member.id !== memberId) || []
            };
          }
          return team;
        })
      );
      toast.success("Team member removed successfully!");
    } catch (error: any) {
      console.error("Error removing team member:", error.message);
      toast.error(error.message || "Error removing team member");
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: status as any } : app
        )
      );
      toast.success("Application status updated successfully!");
    } catch (error: any) {
      console.error("Error updating application status:", error.message);
      toast.error(error.message || "Error updating application status");
    }
  };

  const getUserProjects = () => {
    if (!user) return [];
    
    return projects.filter(project => project.created_by === user.id);
  };

  const value: ProjectContextType = {
    projects,
    applications,
    teams,
    loading,
    fetchProjects,
    fetchTeams,
    createProject,
    fetchProject,
    applyToProject,
    updateTaskStatus,
    addTask,
    addMilestone,
    createTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateApplicationStatus,
    getUserProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
