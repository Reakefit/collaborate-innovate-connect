
import { supabase } from '@/lib/supabase';
import { Team, TeamMember, Json, TeamMemberRole, TeamMemberStatus } from '@/types/database';
import { toast } from 'sonner';

export const createTeam = async (
  teamData: any,
  user: any,
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<Team | null> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to create a team');
    }
    
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: teamData.name,
        description: teamData.description,
        lead_id: user.id,
        skills: teamData.skills || [],
        portfolio_url: teamData.portfolio_url || null,
        achievements: teamData.achievements || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Add the team creator as a member
    await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: user.id,
        role: 'lead',
        status: 'active'
      });
    
    const newTeam: Team = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      lead_id: data.lead_id,
      skills: data.skills || [],
      portfolio_url: data.portfolio_url || null,
      achievements: data.achievements as Json,
      created_at: data.created_at,
      updated_at: data.updated_at,
      members: [{
        id: '',
        user_id: user.id,
        team_id: data.id,
        role: 'lead',
        status: 'active',
        joined_at: new Date().toISOString()
      }]
    };
    
    setTeams(prevTeams => [...prevTeams, newTeam]);
    
    toast.success('Team created successfully!');
    return newTeam;
  } catch (error: any) {
    setError(error.message);
    console.error('Error creating team:', error);
    toast.error('Failed to create team.');
    return null;
  } finally {
    setLoading(false);
  }
};

export const updateTeam = async (
  id: string, 
  teamData: any,
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('teams')
      .update({
        name: teamData.name,
        description: teamData.description,
        skills: teamData.skills || [],
        portfolio_url: teamData.portfolio_url || null,
        achievements: teamData.achievements || null
      })
      .eq('id', id);
    
    if (error) throw error;
    
    setTeams(prevTeams =>
      prevTeams.map(team => (team.id === id ? { ...team, ...teamData } : team))
    );
    
    toast.success('Team updated successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error updating team:', error);
    toast.error('Failed to update team.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const deleteTeam = async (
  id: string,
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setTeams(prevTeams => prevTeams.filter(team => team.id !== id));
    
    toast.success('Team deleted successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error deleting team:', error);
    toast.error('Failed to delete team.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const joinTeam = async (
  teamId: string,
  user: any,
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to join a team');
    }
    
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'member',
        status: 'active'
      });
    
    if (error) throw error;
    
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId
          ? { 
              ...team, 
              members: [
                ...(team.members || []), 
                { 
                  id: '', 
                  user_id: user.id, 
                  team_id: teamId,
                  role: 'member' as TeamMemberRole, 
                  status: 'active' as TeamMemberStatus,
                  joined_at: new Date().toISOString()
                } 
              ] 
            }
          : team
      )
    );
    
    toast.success('Joined team successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error joining team:', error);
    toast.error('Failed to join team.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const leaveTeam = async (
  teamId: string,
  user: any,
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user) {
      throw new Error('You must be logged in to leave a team');
    }
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId
          ? { ...team, members: (team.members || []).filter(member => member.user_id !== user.id) }
          : team
      )
    );
    
    toast.success('Left team successfully!');
    return true;
  } catch (error: any) {
    setError(error.message);
    console.error('Error leaving team:', error);
    toast.error('Failed to leave team.');
    return false;
  } finally {
    setLoading(false);
  }
};

export const fetchTeam = async (
  id: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<Team | null> => {
  try {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const formattedTeam: Team = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      lead_id: data.lead_id,
      skills: data.skills || [],
      portfolio_url: data.portfolio_url || null,
      achievements: data.achievements as Json,
      created_at: data.created_at,
      updated_at: data.updated_at,
      members: []
    };
    
    return formattedTeam;
  } catch (error: any) {
    setError(error.message);
    console.error('Error fetching team:', error);
    return null;
  } finally {
    setLoading(false);
  }
};

export const fetchTeams = async (
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> => {
  try {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) throw error;
    
    const formattedTeams: Team[] = data.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description || '',
      lead_id: team.lead_id,
      skills: team.skills || [],
      portfolio_url: team.portfolio_url || null,
      achievements: team.achievements as Json,
      created_at: team.created_at,
      updated_at: team.updated_at,
      members: []
    }));
    
    setTeams(formattedTeams);
  } catch (error: any) {
    setError(error.message);
    console.error('Error fetching teams:', error);
  } finally {
    setLoading(false);
  }
};

export const fetchUserTeams = async (
  user: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<Team[]> => {
  try {
    setLoading(true);
    setError(null);

    if (!user) {
      console.warn('User is not authenticated.');
      return [];
    }

    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (teamMembersError) {
      throw teamMembersError;
    }

    const teamIds = teamMembers.map(tm => tm.team_id);

    if (teamIds.length === 0) {
      return [];
    }

    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) {
      throw teamsError;
    }

    const formattedTeams: Team[] = (teamsData || []).map(team => ({
      id: team.id,
      name: team.name,
      description: team.description || '',
      lead_id: team.lead_id,
      skills: team.skills || [],
      portfolio_url: team.portfolio_url || null,
      achievements: team.achievements as Json,
      created_at: team.created_at,
      updated_at: team.updated_at,
      members: []
    }));

    return formattedTeams;
  } catch (error: any) {
    setError(error.message);
    console.error('Error fetching user teams:', error);
    return [];
  } finally {
    setLoading(false);
  }
};
