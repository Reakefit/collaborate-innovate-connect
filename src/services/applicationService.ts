
import { supabase } from '@/lib/supabase';
import { Application, ApplicationStatus } from '@/types/database';
import { fetchApplicationsWithTeams } from './database';
import { toast } from 'sonner';

export const applyToProject = async (
  projectId: string, 
  teamId: string, 
  coverLetter: string,
  user: any,
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to apply for a project');
    }
    
    const { data, error } = await supabase
      .from('applications')
      .insert({
        project_id: projectId,
        user_id: user.id,
        team_id: teamId,
        cover_letter: coverLetter,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const newApplication: Application = {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      team_id: data.team_id,
      status: data.status as ApplicationStatus,
      cover_letter: data.cover_letter,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    setApplications(prevApplications => [...prevApplications, newApplication]);
    
    toast.success('Application submitted successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error applying to project:', error);
    toast.error('Failed to submit application.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const fetchApplications = async (
  projectId: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<Application[]> => {
  try {
    setLoading(true);
    setError(null);
    
    const applications = await fetchApplicationsWithTeams(projectId);
    return applications;
  } catch (error: any) {
    setError(error.message);
    console.error('Error fetching applications:', error);
    return [];
  } finally {
    setLoading(false);
  }
};

export const updateApplicationStatus = async (
  applicationId: string, 
  status: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);
    
    if (error) throw error;
    
    toast.success(`Application ${status} successfully!`);
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error updating application status:', error);
    toast.error('Failed to update application status.');
    return false;
  } finally {
    setLoading(false);
  }
};
