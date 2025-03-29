import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, UserPlus, Calendar, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from "@/context/ProjectContext";
import { Team } from "@/types/database";

const Teams = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { teams, createTeam, addTeamMember, removeTeamMember } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleCreateTeam = async () => {
    if (!newTeamName || !newTeamDescription) {
      alert("Team name and description are required");
      return;
    }

    setIsCreatingTeam(true);
    try {
      await createTeam(newTeamName, newTeamDescription, user!.id);
      setShowCreateTeamModal(false);
      setNewTeamName("");
      setNewTeamDescription("");
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !selectedTeam) {
      alert("Member email and team selection are required");
      return;
    }

    setIsAddingMember(true);
    try {
      await addTeamMember(selectedTeam.id, newMemberEmail);
      setShowAddMemberModal(false);
      setNewMemberEmail("");
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      await removeTeamMember(teamId, memberId);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-64"
          />
          <Button onClick={() => setShowCreateTeamModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
              <CardDescription className="text-gray-500">{team.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {team.members?.length || 0} Members
                </span>
              </div>
              <div>
                {team.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.user.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    {profile?.role === "startup" && team.lead_id !== member.user_id && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveMember(team.id, member.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50 border-t">
              {profile?.role === "startup" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMemberModal(true);
                    setSelectedTeam(team);
                  }}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Team Modal */}
      <Dialog open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate on projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCreateTeam} disabled={isCreatingTeam}>
              {isCreatingTeam ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to the team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Member Email</Label>
              <Input
                id="email"
                placeholder="example@email.com"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleAddMember} disabled={isAddingMember}>
              {isAddingMember ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
