import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Team } from '@/types/database';

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const newTeamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
});

const Teams = () => {
  const { user, profile } = useAuth();
  const { teams, loading, fetchTeams, createTeam, deleteTeam, 
    addTeamMember, removeTeamMember } = useProject();
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleInviteMember = async () => {
    try {
      if (!selectedTeam) return;
      
      // Pass the correct parameters
      await addTeamMember(selectedTeam.id, inviteEmail);
      
      setInviteEmail("");
      setShowInviteModal(false);
      toast.success("Invitation sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error sending invitation");
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      await removeTeamMember(teamId, memberId);
      toast.success("Member removed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error removing member");
    }
  };

  const newTeamForm = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleCreateTeam = async (values: z.infer<typeof newTeamSchema>) => {
    try {
      await createTeam({
        name: values.name,
        description: values.description,
        lead_id: user?.id || '',
        skills: [],
      });
      setShowNewTeamModal(false);
      toast.success("Team created successfully!");
      newTeamForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Error creating team");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      toast.success("Team deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error deleting team");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading teams...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Teams</CardTitle>
          <CardDescription>Manage and collaborate with your teams.</CardDescription>
        </CardHeader>
        <Button onClick={() => setShowNewTeamModal(true)}>Create New Team</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
              <CardDescription className="text-gray-500">{team.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-2">Members:</h3>
              {team.members && team.members.length > 0 ? (
                <ul>
                  {team.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between py-2 border-b">
                      <span>{member.user?.name} ({member.role})</span>
                      {member.user_id !== user?.id && (
                        <Button variant="outline" size="sm" onClick={() => handleRemoveMember(team.id, member.id)}>
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No members yet.</p>
              )}
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Button onClick={() => {
                setSelectedTeam(team);
                setShowInviteModal(true);
              }}>
                Invite Member
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteTeam(team.id)}>Delete Team</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* New Team Modal */}
      <Dialog open={showNewTeamModal} onOpenChange={setShowNewTeamModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate on projects.
            </DialogDescription>
          </DialogHeader>
          <Form {...newTeamForm}>
            <form onSubmit={newTeamForm.handleSubmit(handleCreateTeam)} className="space-y-4">
              <FormField
                control={newTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newTeamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a new member to {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit((data) => {
              setInviteEmail(data.email);
              handleInviteMember();
            })} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Invite</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
