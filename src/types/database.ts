export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectCategory = 'web_development' | 'mobile_app' | 'data_science' | 'machine_learning' | 'ui_ux_design' | 'blockchain' | 'game_development' | 'other';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

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
  payment_model: string;
  equity_percentage: number | null;
  hourly_rate: number | null;
  fixed_amount: number | null;
  stipend_amount: number | null;
  deliverables: string[];
  status: string;
  selected_team: string | null;
  created_at: string;
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
  education: Education[];
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

export interface Application {
  id: string;
  project_id: string;
  user_id: string;
  team_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  updated_at: string;
  team?: any; // Team details when joined in a query
}
