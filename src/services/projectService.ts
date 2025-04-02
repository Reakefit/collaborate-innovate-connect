
import { supabase } from '@/lib/supabase';
import { Project, ProjectCategory, ProjectStatus, PaymentModel } from '@/types/database';
import { toast } from 'sonner';
import { debugLog, debugError } from '@/utils/debug';

export const fetchProjects = async (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) throw error;
    
    // Fix type conversions for Project data
    const formattedProjects: Project[] = data.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      created_by: project.created_by,
      category: (project.category || 'other') as ProjectCategory,
      required_skills: project.required_skills || [],
      start_date: project.start_date,
      end_date: project.end_date,
      team_size: project.team_size,
      payment_model: (project.payment_model || 'unpaid') as PaymentModel,
      stipend_amount: project.stipend_amount ? Number(project.stipend_amount) : null,
      // Add type casting for optional properties that might not exist
      equity_percentage: null,
      hourly_rate: null,
      fixed_amount: null,
      deliverables: project.deliverables || [],
      created_at: project.created_at,
      selected_team: project.selected_team || null,
      status: (project.status || 'open') as ProjectStatus
    }));
    
    setProjects(formattedProjects);
    console.log("Fetched projects:", formattedProjects);
  } catch (error: any) {
    setError(error.message);
    console.error('Error fetching projects:', error);
  } finally {
    setLoading(false);
  }
};

export const fetchProject = async (
  id: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): Promise<Project | null> => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        milestones:project_milestones(
          *,
          tasks:project_tasks(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Use type assertion to handle optional fields
    const projectData = data as any;
    
    // Format the project data to match the Project type
    const formattedProject: Project = {
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      created_by: projectData.created_by,
      category: (projectData.category || 'other') as ProjectCategory,
      required_skills: projectData.required_skills || [],
      start_date: projectData.start_date,
      end_date: projectData.end_date,
      team_size: projectData.team_size,
      payment_model: (projectData.payment_model || 'unpaid') as PaymentModel,
      stipend_amount: projectData.stipend_amount ? Number(projectData.stipend_amount) : null,
      // Handle optional fields properly
      equity_percentage: null,
      hourly_rate: null,
      fixed_amount: null,
      deliverables: projectData.deliverables || [],
      created_at: projectData.created_at,
      selected_team: projectData.selected_team || null,
      status: (projectData.status || 'open') as ProjectStatus,
      milestones: Array.isArray(projectData.milestones) ? projectData.milestones.map((milestone: any) => ({
        ...milestone,
        status: milestone.status || 'not_started',
        tasks: Array.isArray(milestone.tasks) ? milestone.tasks.map((task: any) => ({
          ...task,
          status: task.status || 'todo'
        })) : []
      })) : []
    };
    
    return formattedProject;
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return null;
  } finally {
    setLoading(false);
  }
};

export const createProject = async (
  projectData: any,
  user: any,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<Project | null> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to create a project');
    }
    
    debugLog('CreateProject', 'Creating project with data:', projectData);
    
    // Ensure data types are correct and only include fields that exist in the database
    const projectPayload = {
      title: projectData.title,
      description: projectData.description,
      created_by: user.id,
      category: projectData.category,
      required_skills: Array.isArray(projectData.required_skills) ? projectData.required_skills : [],
      start_date: projectData.start_date,
      end_date: projectData.end_date,
      team_size: Number(projectData.team_size),
      payment_model: projectData.payment_model,
      stipend_amount: projectData.stipend_amount ? Number(projectData.stipend_amount) : null,
      deliverables: Array.isArray(projectData.deliverables) ? projectData.deliverables : [],
      status: 'open'
    };
    
    debugLog('CreateProject', 'Sending payload to Supabase:', projectPayload);
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectPayload)
      .select()
      .single();
    
    if (error) {
      debugError('CreateProject', error, 'Failed to create project');
      throw error;
    }
    
    debugLog('CreateProject', 'Project created successfully:', data);
    
    // Cast for optional fields
    const newProjectData = data as any;
    
    // Format the created project to match the Project type
    const newProject: Project = {
      id: newProjectData.id,
      title: newProjectData.title,
      description: newProjectData.description,
      created_by: newProjectData.created_by,
      category: (newProjectData.category || 'other') as ProjectCategory,
      required_skills: newProjectData.required_skills || [],
      start_date: newProjectData.start_date,
      end_date: newProjectData.end_date,
      team_size: newProjectData.team_size,
      payment_model: (newProjectData.payment_model || 'unpaid') as PaymentModel,
      stipend_amount: newProjectData.stipend_amount ? Number(newProjectData.stipend_amount) : null,
      equity_percentage: null, // Set default value for required type
      hourly_rate: null, // Set default value for required type
      fixed_amount: null, // Set default value for required type
      deliverables: newProjectData.deliverables || [],
      created_at: newProjectData.created_at,
      selected_team: newProjectData.selected_team || null,
      status: (newProjectData.status || 'open') as ProjectStatus
    };
    
    // Add the new project to the state
    setProjects(prevProjects => [...prevProjects, newProject]);
    
    toast.success('Project created successfully!');
    return newProject;
  } catch (error: any) {
    setError(error.message);
    debugError('CreateProject', error, 'Error creating project');
    toast.error(`Failed to create project: ${error.message}`);
    return null;
  } finally {
    setLoading(false);
  }
};

export const updateProject = async (
  id: string, 
  projectData: any,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('projects')
      .update({
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        required_skills: projectData.required_skills || [],
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        team_size: projectData.team_size,
        payment_model: projectData.payment_model,
        stipend_amount: projectData.stipend_amount || null,
        deliverables: projectData.deliverables || []
      })
      .eq('id', id);
    
    if (error) throw error;
    
    setProjects(prevProjects =>
      prevProjects.map(project => (project.id === id ? { ...project, ...projectData } : project))
    );
    
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error updating project:', error);
    return false;
  } finally {
    setLoading(false);
  }
};

export const deleteProject = async (
  id: string,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error deleting project:', error);
    return false;
  } finally {
    setLoading(false);
  }
};

export const updateProjectStatus = async (
  id: string, 
  status: string,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('projects')
      .update({ status: status })
      .eq('id', id);

    if (error) throw error;

    setProjects(prevProjects =>
      prevProjects.map(project => (project.id === id ? { ...project, status: status as ProjectStatus } : project))
    );

    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error updating project status:', error);
    return false;
  } finally {
    setLoading(false);
  }
};
