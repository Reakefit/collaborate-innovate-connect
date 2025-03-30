
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Team, TeamMember, TeamTask } from '@/types/database';
import { Loader2, Users, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    loading, 
    fetchTeam, 
    fetchTeamTasks,
    joinTeam,
    leaveTeam
  } = useProject();

  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isTeamLead, setIsTeamLead] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    const loadTeamData = async () => {
      try {
        const teamData = await fetchTeam(teamId);
        if (teamData) {
          setTeam(teamData);

          // Check if current user is a team member
          if (user) {
            const isMember = teamData.members?.some(member => member.user_id === user.id);
            setIsTeamMember(!!isMember);
            setIsTeamLead(teamData.lead_id === user.id);
          }

          // Load team tasks
          const teamTasks = await fetchTeamTasks(teamId);
          setTasks(teamTasks || []);
        }
      } catch (error) {
        console.error('Error loading team data:', error);
        toast.error('Failed to load team data');
      }
    };

    loadTeamData();
  }, [teamId, fetchTeam, fetchTeamTasks, user]);

  const handleJoinTeam = async () => {
    if (!teamId || !user) return;
    
    try {
      const success = await joinTeam(teamId);
      if (success) {
        setIsTeamMember(true);
        toast.success('Successfully joined the team!');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
    }
  };

  const handleLeaveTeam = async () => {
    if (!teamId || !user) return;
    
    try {
      const success = await leaveTeam(teamId);
      if (success) {
        setIsTeamMember(false);
        toast.success('Successfully left the team');
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="teams">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout activeTab="teams">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Team Not Found</h3>
          <p className="mt-1 text-muted-foreground">
            The team you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/teams')} className="mt-4">
            Go Back to Teams
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="teams">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            {team.name}
            {isTeamLead && (
              <Badge className="ml-3 bg-primary">Team Lead</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {team.description}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {!isTeamMember && (
            <Button onClick={handleJoinTeam}>
              Join Team
            </Button>
          )}
          
          {isTeamMember && !isTeamLead && (
            <Button variant="outline" onClick={handleLeaveTeam}>
              Leave Team
            </Button>
          )}
          
          {isTeamLead && (
            <Button variant="outline" onClick={() => navigate(`/teams/${teamId}/edit`)}>
              Edit Team
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          {isTeamMember && <TabsTrigger value="projects">Projects</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>About this Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="mt-1 text-muted-foreground">
                      {team.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  {team.skills && team.skills.length > 0 && (
                    <div>
                      <h3 className="font-medium">Skills</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {team.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {team.portfolio_url && (
                    <div>
                      <h3 className="font-medium">Portfolio</h3>
                      <a href={team.portfolio_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline">
                        View Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>{team.members?.length || 0} Members</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    <span>{tasks.filter(task => task.status === 'completed').length} Completed Tasks</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                    <span>{tasks.filter(task => task.status === 'in_progress').length} In Progress</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {team.members?.length || 0} members in this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!team.members || team.members.length === 0) ? (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">This team has no members yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {team.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{member.name?.substring(0, 2) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{member.name || 'Unknown User'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={member.role === 'lead' ? 'default' : 'outline'}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Tasks</CardTitle>
                <CardDescription>
                  Manage and track tasks for this team
                </CardDescription>
              </div>
              {isTeamMember && (
                <Button size="sm" onClick={() => navigate(`/teams/${teamId}/tasks/new`)}>
                  Add Task
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {(!tasks || tasks.length === 0) ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No tasks have been created yet</p>
                  {isTeamMember && (
                    <Button variant="outline" className="mt-4" onClick={() => navigate(`/teams/${teamId}/tasks/new`)}>
                      Create First Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {task.description || 'No description'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center mt-3 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isTeamMember && (
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Team Projects</CardTitle>
                <CardDescription>
                  Projects this team is working on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No active projects assigned to this team
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/projects')}>
                    Browse Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </DashboardLayout>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'todo':
      return 'bg-slate-100 text-slate-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export default TeamPage;
