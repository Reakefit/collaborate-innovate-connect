import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import { useProject } from '@/context/ProjectContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

export default function CreateProjectPage() {
  // This is a wrapper component that enforces role-based access control
  return (
    <ProtectedRoute requiredRole="startup" requiredPermission="create_project">
      <CreateProjectContent />
    </ProtectedRoute>
  );
}

// This is the actual content that will only be shown to authorized users
function CreateProjectContent() {
  const { user } = useAuth();
  const { createProject } = useProject();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentModel, setPaymentModel] = useState('');
  const [stipendAmount, setStipendAmount] = useState('');
  const [equityPercentage, setEquityPercentage] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [teamSize, setTeamSize] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "web_development",
    "mobile_development",
    "data_science",
    "machine_learning",
    "ui_ux_design",
    "devops",
    "cybersecurity",
    "blockchain",
    "other",
  ];

  const paymentModels = ["hourly", "fixed", "equity", "unpaid", "stipend"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const projectData = {
        title,
        description,
        category,
        deliverables,
        required_skills: requiredSkills,
        start_date: startDate,
        end_date: endDate,
        payment_model: paymentModel,
        stipend_amount: stipendAmount,
        equity_percentage: equityPercentage,
        hourly_rate: hourlyRate,
        fixed_amount: fixedAmount,
        created_by: user.id,
        team_size: teamSize,
      };

      await createProject(projectData);
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Project</CardTitle>
          <CardDescription>
            Fill in the details below to post your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                placeholder="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategory} defaultValue={category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliverables">Deliverables</Label>
              <Input
                type="text"
                id="deliverables"
                placeholder="Enter deliverables separated by commas"
                value={deliverables.join(",")}
                onChange={(e) =>
                  setDeliverables(
                    e.target.value.split(",").map((item) => item.trim())
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <MultiSelect
                options={[
                  { value: "javascript", label: "JavaScript" },
                  { value: "react", label: "React" },
                  { value: "node_js", label: "Node.js" },
                  { value: "python", label: "Python" },
                  { value: "typescript", label: "TypeScript" },
                  { value: "java", label: "Java" },
                  { value: "c++", label: "C++" },
                  { value: "swift", label: "Swift" },
                  { value: "kotlin", label: "Kotlin" },
                  { value: "sql", label: "SQL" },
                  { value: "mongodb", label: "MongoDB" },
                  { value: "aws", label: "AWS" },
                  { value: "docker", label: "Docker" },
                  { value: "kubernetes", label: "Kubernetes" },
                  { value: "git", label: "Git" },
                ]}
                value={requiredSkills}
                onChange={setRequiredSkills}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentModel">Payment Model</Label>
              <Select onValueChange={setPaymentModel} defaultValue={paymentModel}>
                <SelectTrigger id="paymentModel">
                  <SelectValue placeholder="Select a payment model" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentModel === "stipend" && (
                <div>
                  <Label htmlFor="stipendAmount">Stipend Amount</Label>
                  <Input
                    type="number"
                    id="stipendAmount"
                    placeholder="Enter stipend amount"
                    value={stipendAmount}
                    onChange={(e) => setStipendAmount(e.target.value)}
                  />
                </div>
              )}

              {paymentModel === "equity" && (
                <div>
                  <Label htmlFor="equityPercentage">Equity Percentage</Label>
                  <Input
                    type="number"
                    id="equityPercentage"
                    placeholder="Enter equity percentage"
                    value={equityPercentage}
                    onChange={(e) => setEquityPercentage(e.target.value)}
                  />
                </div>
              )}

              {paymentModel === "hourly" && (
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
                  <Input
                    type="number"
                    id="hourlyRate"
                    placeholder="Enter hourly rate"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              )}

              {paymentModel === "fixed" && (
                <div>
                  <Label htmlFor="fixedAmount">Fixed Amount</Label>
                  <Input
                    type="number"
                    id="fixedAmount"
                    placeholder="Enter fixed amount"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                type="number"
                id="teamSize"
                placeholder="Enter team size"
                value={teamSize !== undefined ? teamSize : ""}
                onChange={(e) => setTeamSize(Number(e.target.value))}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating Project..." : "Create Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
