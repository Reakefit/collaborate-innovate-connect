
// Update Profile interface to include all necessary fields
export interface Profile {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  role: "student" | "startup";
  avatar_url: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  
  // Startup specific fields
  company_name?: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  founded?: string;  // Changed from number to string
  website?: string;
  stage?: string;
  project_needs?: string[];
  
  // Student specific fields
  skills?: string[];
  education?: Education[];
  portfolio_url?: string;
  resume_url?: string;
  github_url?: string;
  linkedin_url?: string;
  availability?: string;
  interests?: string[];
  experience_level?: string;
  preferred_categories?: string[];
  college?: string;
  graduation_year?: string;
  major?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current?: boolean;
}

// Project related interfaces
export type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled";
export type ProjectCategory = "web_development" | "mobile_development" | "data_science" | "machine_learning" | "ui_ux_design" | "devops" | "cybersecurity" | "blockchain" | "other";
export type PaymentModel = "hourly" | "fixed" | "equity" | "unpaid" | "stipend";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory | string;
  deliverables: string[];
  required_skills: string[];
  start_date: string;
  end_date: string;
  payment_model: PaymentModel | string;
  stipend_amount?: string;
  equity_percentage?: string;
  hourly_rate?: string;
  fixed_amount?: string;
  status: ProjectStatus | string;
  created_by: string;
  created_at: string;
  updated_at: string;
  selected_team?: string;
  team_size?: number;
  milestones?: ProjectMilestone[];
  resources?: ProjectResource[];
  applications?: Application[];
}

export type MilestoneStatus = "not_started" | "in_progress" | "completed" | "delayed";

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: MilestoneStatus | string;
  created_at: string;
  updated_at: string;
  assigned_team_id?: string;
  tasks?: ProjectTask[];
}

export type TaskStatus = "todo" | "in_progress" | "review" | "completed" | "blocked";

export interface ProjectTask {
  id: string;
  milestone_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus | string;
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectResource {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  url: string;
  type: "document" | "link" | "image" | "video";
  created_at: string;
  updated_at: string;
}

export type TeamRole = "lead" | "member";
export type TeamMemberStatus = "invited" | "active" | "inactive";

export interface Team {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url?: string;
  achievements?: any;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole | string;
  status: TeamMemberStatus | string;
  joined_at?: string;
  name: string;
  user?: {
    name: string;
  };
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Application {
  id: string;
  project_id: string;
  team_id: string;
  user_id: string;
  cover_letter: string;
  status: ApplicationStatus | string;
  created_at: string;
  updated_at: string;
  team?: Team;
  team_lead?: TeamMember;
  project?: Project;
}

// Add missing types needed for the Messages page
export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    name: string;
  };
}

// Add missing types needed for the Team page
export interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

export type TeamTaskStatus = "todo" | "in_progress" | "review" | "done" | "completed" | "blocked";

export interface TeamTask {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  status: TeamTaskStatus | string;
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_to_profile?: {
    name: string;
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
