export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'student' | 'startup'
          avatar_url: string | null
          created_at: string
          updated_at: string
          company_name: string | null
          company_description: string | null
          industry: string | null
          company_size: string | null
          founded: number | null
          website: string | null
          skills: string[] | null
          education: Json | null
          portfolio_url: string | null
          resume_url: string | null
          github_url: string | null
          linkedin_url: string | null
          bio: string | null
          availability: string | null
          interests: string[] | null
          experience_level: string | null
          preferred_categories: string[] | null
          reputation_score: number
          total_projects: number
          completed_projects: number
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'student' | 'startup'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          company_name?: string | null
          company_description?: string | null
          industry?: string | null
          company_size?: string | null
          founded?: number | null
          website?: string | null
          skills?: string[] | null
          education?: Json | null
          portfolio_url?: string | null
          resume_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          bio?: string | null
          availability?: string | null
          interests?: string[] | null
          experience_level?: string | null
          preferred_categories?: string[] | null
          reputation_score?: number
          total_projects?: number
          completed_projects?: number
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'student' | 'startup'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          company_name?: string | null
          company_description?: string | null
          industry?: string | null
          company_size?: string | null
          founded?: number | null
          website?: string | null
          skills?: string[] | null
          education?: Json | null
          portfolio_url?: string | null
          resume_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          bio?: string | null
          availability?: string | null
          interests?: string[] | null
          experience_level?: string | null
          preferred_categories?: string[] | null
          reputation_score?: number
          total_projects?: number
          completed_projects?: number
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          deliverables: string[]
          start_date: string
          end_date: string
          payment_model: string
          stipend_amount: number | null
          required_skills: string[]
          team_size: number
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_by: string
          created_at: string
          updated_at: string
          selected_team_id: string | null
          progress: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          deliverables: string[]
          start_date: string
          end_date: string
          payment_model: string
          stipend_amount?: number | null
          required_skills: string[]
          team_size: number
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_by: string
          created_at?: string
          updated_at?: string
          selected_team_id?: string | null
          progress?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          deliverables?: string[]
          start_date?: string
          end_date?: string
          payment_model?: string
          stipend_amount?: number | null
          required_skills?: string[]
          team_size?: number
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          created_by?: string
          created_at?: string
          updated_at?: string
          selected_team_id?: string | null
          progress?: number
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string
          lead_id: string
          skills: string[]
          portfolio_url: string | null
          achievements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          lead_id: string
          skills?: string[]
          portfolio_url?: string | null
          achievements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          lead_id?: string
          skills?: string[]
          portfolio_url?: string | null
          achievements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          role: 'lead' | 'member'
          status: 'pending' | 'active' | 'rejected'
          joined_at: string
        }
        Insert: {
          team_id: string
          user_id: string
          role: 'lead' | 'member'
          status?: 'pending' | 'active' | 'rejected'
          joined_at?: string
        }
        Update: {
          team_id?: string
          user_id?: string
          role?: 'lead' | 'member'
          status?: 'pending' | 'active' | 'rejected'
          joined_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          project_id: string
          team_id: string | null
          user_id: string | null
          cover_letter: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          team_id?: string | null
          user_id?: string | null
          cover_letter: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          team_id?: string | null
          user_id?: string | null
          cover_letter?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      application_members: {
        Row: {
          application_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          application_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          application_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          due_date: string
          status: 'pending' | 'in_progress' | 'completed' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          due_date: string
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          due_date?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          milestone_id: string
          title: string
          description: string | null
          assigned_to: string | null
          status: 'todo' | 'in_progress' | 'review' | 'done'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          milestone_id: string
          title: string
          description?: string | null
          assigned_to?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          milestone_id?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          project_id: string
          sender_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sender_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type Profile = {
  id: string;
  name: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: 'lead' | 'member';
  status: 'pending' | 'active' | 'rejected';
  joined_at: string;
  user?: Profile;
};

export type Team = {
  id: string;
  name: string;
  description: string;
  lead_id: string;
  skills: string[];
  portfolio_url?: string;
  achievements?: Record<string, any>;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  progress?: number;
};

export type Application = {
  id: string;
  project_id: string;
  team_id: string;
  cover_letter: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  team?: Team & { members: TeamMember[] };
  project?: Project;
};
