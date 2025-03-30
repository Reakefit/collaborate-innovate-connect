import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import { useProject } from '@/context/ProjectContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const teamSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  portfolio_url: z.string().optional(),
});

export default function TeamsPage() {
  // This is a wrapper component that enforces role-based access control
  return (
    <ProtectedRoute requiredRole="student" requiredPermission="create_team" requireVerification={true}>
      <TeamsContent />
    </ProtectedRoute>
  );
}

// This is the actual content that will only be shown to authorized users
function TeamsContent() {
  const { user } = useAuth();
  const { teams, createTeam, deleteTeam } = useProject();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      skills: [],
      portfolio_url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
    try {
      await createTeam({ ...values, lead_id: user.id });
      toast.success("Team created successfully!");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Card>
              <CardHeader>
                <CardTitle>Create a new team</CardTitle>
                <CardDescription>
                  Teams help you collaborate on projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Team Awesome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A team of talented individuals"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Create Team
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
      {teams.length === 0 ? (
        <Card className="border-none shadow-lg bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Create your first team to start collaborating on projects!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your team and remove all data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await deleteTeam(team.id);
                                toast.success("Team deleted successfully!");
                              } catch (error: any) {
                                toast.error(
                                  error.message || "Failed to delete team"
                                );
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
