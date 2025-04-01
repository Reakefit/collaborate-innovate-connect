export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectCategory = 'web_development' | 'mobile_app' | 'data_science' | 'machine_learning' | 'ui_ux_design' | 'blockchain' | 'game_development' | 'other';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'draft';

export type PaymentModel = 'unpaid' | 'stipend' | 'hourly' | 'fixed' | 'equity';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'pending' | 'cancelled' | 'delayed';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'completed' | 'review';

export type TeamTaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'cancelled' | 'completed';

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
  equity_percentage: number | null;
  hourly_rate: number | null;
  fixed_amount: number | null;
  stipend_amount: number | null;
  deliverables: string[];
  status: ProjectStatus;
  selected_team: string | null;
  created_at: string;
  milestones?: ProjectMilestone[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  current: boolean;
}

export interface Profile {
  id: string;
  name: string;
  role: "student" | "startup" | "college_admin" | "platform_admin";
  avatar_url: string | null;
  bio: string | null;
  company_name: string | null;
  company_description: string | null;
  industry: string | null;
  company_size: string | null;
  founded: string | null;
  website: string | null;
  stage: string | null;
  project_needs: string[] | null;
  skills: string[] | null;
  education: Education[] | null;
  portfolio_url: string | null;
  resume_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  availability: string | null;
  interests: string[] | null;
  experience_level: string | null;
  preferred_categories: string[] | null;
  college: string | null;
  graduation_year: string | null;
  major: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  project_id: string;
  user_id: string;
  team_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  updated_at: string;
  team?: Team; // Team details when joined in a query
}

export interface Team {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url: string | null;
  achievements: any | null;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  name?: string;
}

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

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: MilestoneStatus;
  tasks?: ProjectTask[];
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    name: string;
  };
}
