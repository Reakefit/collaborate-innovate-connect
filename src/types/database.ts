
import { Json } from './supabase';

export type { Json } from './supabase';

export interface Project {
  id: string;
  title: string;
  description: string;
  created_by: string;
  category: ProjectCategory;
  required_skills: string[];
  start_date: string;
  end_date: string;
  team_size: number;
  payment_model: PaymentModel;
  stipend_amount: number | null;
  equity_percentage: number | null;
  hourly_rate: number | null;
  fixed_amount: number | null;
  deliverables: string[];
  created_at: string;
  selected_team: string | null;
  status: ProjectStatus;
  milestones?: ProjectMilestone[];
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
  | "market_research"
  | "other";

export type ProjectStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "closed";

export type PaymentModel =
  | "unpaid"
  | "stipend"
  | "hourly"
  | "fixed";

export interface Application {
  id: string;
  project_id: string;
  user_id: string;
  team_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected";

export interface Team {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url: string | null;
  achievements: Json | null;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joined_at: string;
}

export type TeamMemberRole = "lead" | "member";
export type TeamMemberStatus = "active" | "inactive";

export interface TeamTask {
  id: string;
  team_id: string;
  title: string;
  description: string;
  status: TeamTaskStatus;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TeamTaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "blocked"
  | "review"
  | "done";

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: MilestoneStatus;
  tasks?: ProjectTask[];
}

export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked"
  | "delayed";

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
}

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "blocked"
  | "review"
  | "done";

export interface Education {
  school: string;
  degree: string;
  field: string;
  start_year: string;
  end_year?: string;
  current?: boolean;
}

export interface Profile {
  id: string;
  name: string;
  role: "student" | "startup" | "college_admin";
  avatar_url: string;
  bio: string;
  company_name: string;
  company_description: string;
  industry: string;
  company_size: string;
  founded: string;
  website: string;
  stage: string;
  project_needs: string[];
  skills: string[];
  education: Json; // Changed from Education[] to Json to match database
  portfolio_url: string;
  resume_url: string;
  github_url: string;
  linkedin_url: string;
  availability: string;
  interests: string[];
  experience_level: string;
  preferred_categories: string[];
  college: string;
  graduation_year: string;
  major: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

// Alias type for Task since it appears in progress.ts
export type Task = ProjectTask;
