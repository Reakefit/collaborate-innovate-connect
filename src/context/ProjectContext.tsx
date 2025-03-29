// Import only the necessary part to fix the import issue with 'default' binding
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Project, ProjectMilestone, ProjectTask, Application, 
  MilestoneStatus, TaskStatus, ProjectStatus 
} from '@/types/database';
import { toast } from 'sonner';

interface ProjectContextType {
  projects: Project[];
  applications: Application[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (projectData: any) => Promise<Project>;
  fetchProject: (projectId: string) => Promise<Project | null>;
  applyToProject: (projectId: string, teamId: string, coverLetter: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  addTask: (projectId: string, milestoneId: string, taskData: any) => Promise<void>;
  addMilestone: (projectId: string, milestoneData: any) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  applications: [],
  loading: false,
  fetchProjects: async () => {},
  createProject: async () => { throw new Error("createProject function not implemented."); },
  fetchProject: async () => null,
  applyToProject: async () => {},
  updateTaskStatus: async () => {},
  addTask: async () => {},
  addMilestone: async () => {},
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
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
        setProjects(projectsData);
      }

      // Fetch applications
      if (user) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id);

        if (applicationsError) {
          throw applicationsError;
        }

        if (applicationsData) {
          setApplications(applicationsData);
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
  }, [supabase, user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
        setProjects((prevProjects) => [...prevProjects, data]);
        return data;
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
          milestones (
            *,
            tasks (*)
          )
        `)
        .eq('id', projectId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        return data as Project;
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
        setApplications((prevApplications) => [...prevApplications, data]);
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
            )
          }))
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
        // Optimistically update the milestones in the local state
        setProjects(prevProjects =>
          prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                milestones: [...(project.milestones || []), data]
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

  const value: ProjectContextType = {
    projects,
    applications,
    loading,
    fetchProjects,
    createProject,
    fetchProject,
    applyToProject,
    updateTaskStatus,
    addTask,
    addMilestone
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
