
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "student" | "startup";
  createdAt: Date;
  avatarUrl?: string;
  // Startup-specific fields
  companyName?: string;
  companyDescription?: string;
  industry?: string;
  companySize?: string;
  founded?: number;
  website?: string;
  stage?: string;
  projectNeeds?: string;
  // Student-specific fields
  skills?: string[];
  education?: Education[];
  portfolio?: string;
  resume?: string;
  github?: string;
  linkedin?: string;
  bio?: string;
  availability?: "full_time" | "part_time" | "internship" | "contract";
  interests?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  preferredCategories?: string[];
  college?: string;
  graduationYear?: string;
  major?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
}

export type TeamRole = "lead" | "member";
export type TeamMemberStatus = "pending" | "active" | "rejected";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type ProjectStatus = "open" | "in_progress" | "completed" | "cancelled";
export type MilestoneStatus = "not_started" | "in_progress" | "completed" | "delayed";
export type TaskStatus = "not_started" | "in_progress" | "completed" | "blocked";
export type TeamTaskStatus = "todo" | "in_progress" | "review" | "done";

export interface Team {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url?: string | null;
  achievements?: any;
  members?: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joined_at: string;
  user: {
    name: string;
  };
}

export interface Application {
  id: string;
  project_id: string;
  team_id: string;
  user_id: string;
  cover_letter: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  team?: Team;
  project?: Project;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  payment_model: string;
  stipend_amount: number;
  required_skills: string[];
  team_size: number;
  created_by: string;
  selected_team?: string;
  created_at: string;
  updated_at: string;
  status: ProjectStatus;
  deliverables?: string[];
  applications?: Application[];
  milestones?: ProjectMilestone[];
  reviews?: ProjectReview[];
  resources?: ProjectResource[];
}

export interface ProjectResource {
  id: string;
  project_id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: MilestoneStatus;
  assigned_team_id?: string;
  created_at: string;
  updated_at: string;
  tasks?: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description: string;
  assigned_to?: string;
  status: TaskStatus;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed?: boolean;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface ProjectReview {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFeedback {
  id: string;
  project_id: string;
  milestone_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectNotification {
  id: string;
  project_id: string;
  user_id: string;
  type: 'message' | 'deadline' | 'task' | 'milestone';
  content: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface TeamTask {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: TeamTaskStatus;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender: {
    name: string;
    avatar_url?: string;
  };
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  due_date?: string;
  milestone_id?: string;
}

export type ProjectCategory = 
  | "web_development" 
  | "mobile_development" 
  | "data_science" 
  | "machine_learning" 
  | "ui_ux_design"
  | "devops"
  | "cybersecurity"
  | "blockchain"
  | "other";

export type PaymentModel = 
  | "hourly" 
  | "fixed" 
  | "equity" 
  | "unpaid" 
  | "stipend";

// Export these as they will be used in multiple files
export type { Message as ProjectDiscussion } from "../services/database";
