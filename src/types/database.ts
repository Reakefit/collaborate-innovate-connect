
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          status: ApplicationStatus;
          cover_letter: string;
          created_at: string;
          updated_at: string;
          team_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          status: ApplicationStatus;
          cover_letter: string;
          created_at?: string;
          updated_at?: string;
          team_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          status?: ApplicationStatus;
          cover_letter?: string;
          created_at?: string;
          updated_at?: string;
          team_id?: string;
        };
      };
      projects: {
        Row: {
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
          stipend_amount: string;
          equity_percentage: string;
          hourly_rate: string;
          fixed_amount: string;
          deliverables: string[];
          created_at: string;
          selected_team: string;
          status: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          created_by: string;
          category: ProjectCategory;
          required_skills?: string[];
          start_date: string;
          end_date: string;
          team_size: number;
          payment_model: string;
          stipend_amount?: string | null;
          equity_percentage?: string | null;
          hourly_rate?: string | null;
          fixed_amount?: string | null;
          deliverables?: string[];
          created_at?: string;
          selected_team?: string;
          status?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          created_by?: string;
          category?: ProjectCategory;
          required_skills?: string[];
          start_date?: string;
          end_date?: string;
          team_size?: number;
          payment_model?: string;
          stipend_amount?: string | null;
          equity_percentage?: string | null;
          hourly_rate?: string | null;
          fixed_amount?: string | null;
          deliverables?: string[];
          created_at?: string;
          selected_team?: string;
          status?: string;
        };
      };
    };
  };
}

export type Project = {
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
  stipend_amount: string | null;
  equity_percentage: string | null;
  hourly_rate: string | null;
  fixed_amount: string | null;
  deliverables: string[];
  created_at: string;
  updated_at?: string;
  selected_team: string | null;
  status: string;
  milestones?: ProjectMilestone[];
  applications?: Application[];
};

export type ProjectCategory = 
  | 'web_development' 
  | 'mobile_app' 
  | 'data_science' 
  | 'machine_learning' 
  | 'blockchain' 
  | 'design' 
  | 'marketing' 
  | 'other';

export type Application = {
  id: string;
  user_id: string;
  project_id: string;
  team_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  updated_at: string;
};

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export type ProjectMilestone = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  due_date: string;
  assigned_team_id?: string;
  created_at: string;
  updated_at: string;
  tasks?: ProjectTask[];
};

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

export type ProjectTask = {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  completed?: boolean;
};

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';

export type ProjectMessage = {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    name: string;
  };
};

export type ProjectReview = {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url?: string;
  achievements?: Json;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  name: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
};

export type TeamTask = {
  id: string;
  team_id: string;
  title: string;
  description: string;
  status: TeamTaskStatus;
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_to_profile?: {
    name: string;
  };
};

export type TeamTaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';

export type TeamMessage = {
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
};
