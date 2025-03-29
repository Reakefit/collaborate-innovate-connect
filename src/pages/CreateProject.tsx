import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

const CreateProject = () => {
  const { user } = useAuth();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentModel, setPaymentModel] = useState('');
  const [stipendAmount, setStipendAmount] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDeliverable = () => {
    if (newDeliverable.trim() !== '') {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    const updatedDeliverables = [...deliverables];
    updatedDeliverables.splice(index, 1);
    setDeliverables(updatedDeliverables);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...requiredSkills];
    updatedSkills.splice(index, 1);
    setRequiredSkills(updatedSkills);
  };

  const handleCreateProject = async () => {
    if (!user) return;

    // Validate form inputs
    if (!title || !description || !category || !startDate || !endDate || !paymentModel || requiredSkills.length === 0) {
      setError("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const projectData = {
        title,
        description,
        category,
        deliverables,
        start_date: startDate,
        end_date: endDate,
        payment_model: paymentModel,
        stipend_amount: stipendAmount ? Number(stipendAmount) : 0,
        required_skills: requiredSkills,
        team_size: teamSize ? Number(teamSize) : 1,
        created_by: user.id,
        status: "open" as const,
        selected_team: null // Add this line to fix the missing property error
      };

      await createProject(projectData);
      navigate("/projects");
    } catch (error: any) {
      setError(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project Description"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MVP Development">MVP Development</SelectItem>
              <SelectItem value="Market Research">Market Research</SelectItem>
              <SelectItem value="GTM Strategy">GTM Strategy</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Content Creation">Content Creation</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="Data Analysis">Data Analysis</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Deliverables</Label>
          <div className="flex">
            <Input
              type="text"
              placeholder="Add deliverable"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
            />
            <Button type="button" onClick={handleAddDeliverable} className="ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap mt-2">
            {deliverables.map((deliverable, index) => (
              <Badge key={index} className="mr-2 mb-2">
                {deliverable}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveDeliverable(index)} />
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="paymentModel">Payment Model</Label>
          <Select onValueChange={setPaymentModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select payment model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pro-bono">Pro-bono</SelectItem>
              <SelectItem value="Stipend">Stipend</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {paymentModel === 'Stipend' && (
          <div>
            <Label htmlFor="stipendAmount">Stipend Amount</Label>
            <Input
              type="number"
              id="stipendAmount"
              value={stipendAmount}
              onChange={(e) => setStipendAmount(e.target.value)}
              placeholder="Stipend Amount"
            />
          </div>
        )}
        <div>
          <Label>Required Skills</Label>
          <div className="flex">
            <Input
              type="text"
              placeholder="Add skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <Button type="button" onClick={handleAddSkill} className="ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap mt-2">
            {requiredSkills.map((skill, index) => (
              <Badge key={index} className="mr-2 mb-2">
                {skill}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveSkill(index)} />
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="teamSize">Team Size</Label>
          <Input
            type="number"
            id="teamSize"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            placeholder="Team Size"
          />
        </div>
        <Button onClick={handleCreateProject} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  );
};

export default CreateProject;
