export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "admin" | "team" | "viewer";
          job_function:
            | "cutter"
            | "scripter"
            | "sm_manager"
            | "backoffice"
            | "sales"
            | "admin";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: "admin" | "team" | "viewer";
          job_function?:
            | "cutter"
            | "scripter"
            | "sm_manager"
            | "backoffice"
            | "sales"
            | "admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: "admin" | "team" | "viewer";
          job_function?:
            | "cutter"
            | "scripter"
            | "sm_manager"
            | "backoffice"
            | "sales"
            | "admin";
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      creators: {
        Row: {
          id: string;
          name: string;
          short_code: string;
          platform: string | null;
          is_active: boolean;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_code: string;
          platform?: string | null;
          is_active?: boolean;
          color: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          short_code?: string;
          platform?: string | null;
          is_active?: boolean;
          color?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      product_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      process_templates: {
        Row: {
          id: string;
          product_type_id: string;
          step_order: number;
          step_name: string;
          step_label: string;
          default_tasks: DefaultTask[];
          created_at: string;
        };
        Insert: {
          id?: string;
          product_type_id: string;
          step_order: number;
          step_name: string;
          step_label: string;
          default_tasks?: DefaultTask[];
          created_at?: string;
        };
        Update: {
          product_type_id?: string;
          step_order?: number;
          step_name?: string;
          step_label?: string;
          default_tasks?: DefaultTask[];
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          contact_email: string | null;
          logo_url: string | null;
          contract_status: "active" | "negotiation" | "paused" | "completed";
          hubspot_deal_id: string | null;
          drive_folder_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_name?: string | null;
          contact_email?: string | null;
          logo_url?: string | null;
          contract_status?: "active" | "negotiation" | "paused" | "completed";
          hubspot_deal_id?: string | null;
          drive_folder_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          logo_url?: string | null;
          contract_status?: "active" | "negotiation" | "paused" | "completed";
          hubspot_deal_id?: string | null;
          drive_folder_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      video_projects: {
        Row: {
          id: string;
          customer_id: string;
          product_type_id: string;
          creator_id: string | null;
          title: string | null;
          video_count: number;
          location: "studio" | "on_site";
          status: string;
          priority: number;
          desired_post_date: string | null;
          latest_post_date: string | null;
          shoot_date: string | null;
          actual_post_date: string | null;
          assigned_cutter: string | null;
          assigned_scripter: string | null;
          assigned_sm_manager: string | null;
          script_url: string | null;
          drive_link: string | null;
          notes: string | null;
          is_on_hold: boolean;
          is_rejected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          product_type_id: string;
          creator_id?: string | null;
          title?: string | null;
          video_count?: number;
          location?: "studio" | "on_site";
          status?: string;
          priority?: number;
          desired_post_date?: string | null;
          latest_post_date?: string | null;
          shoot_date?: string | null;
          actual_post_date?: string | null;
          assigned_cutter?: string | null;
          assigned_scripter?: string | null;
          assigned_sm_manager?: string | null;
          script_url?: string | null;
          drive_link?: string | null;
          notes?: string | null;
          is_on_hold?: boolean;
          is_rejected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_id?: string;
          product_type_id?: string;
          creator_id?: string | null;
          title?: string | null;
          video_count?: number;
          location?: "studio" | "on_site";
          status?: string;
          priority?: number;
          desired_post_date?: string | null;
          latest_post_date?: string | null;
          shoot_date?: string | null;
          actual_post_date?: string | null;
          assigned_cutter?: string | null;
          assigned_scripter?: string | null;
          assigned_sm_manager?: string | null;
          script_url?: string | null;
          drive_link?: string | null;
          notes?: string | null;
          is_on_hold?: boolean;
          is_rejected?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          pipeline_step: string;
          title: string;
          assigned_to: string | null;
          estimated_minutes: number | null;
          deadline: string | null;
          is_completed: boolean;
          completed_at: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          pipeline_step: string;
          title: string;
          assigned_to?: string | null;
          estimated_minutes?: number | null;
          deadline?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          pipeline_step?: string;
          title?: string;
          assigned_to?: string | null;
          estimated_minutes?: number | null;
          deadline?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      postings: {
        Row: {
          id: string;
          project_id: string;
          date: string;
          creator_id: string;
          platform: string | null;
          status: "planned" | "posted" | "rescheduled";
          posted_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          date: string;
          creator_id: string;
          platform?: string | null;
          status?: "planned" | "posted" | "rescheduled";
          posted_url?: string | null;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          date?: string;
          creator_id?: string;
          platform?: string | null;
          status?: "planned" | "posted" | "rescheduled";
          posted_url?: string | null;
        };
        Relationships: [];
      };
      approvals: {
        Row: {
          id: string;
          project_id: string;
          stage: string;
          status: "pending" | "approved" | "changes_requested";
          feedback: string | null;
          approved_by: string | null;
          approved_at: string | null;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          stage: string;
          status?: "pending" | "approved" | "changes_requested";
          feedback?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          token?: string;
          created_at?: string;
        };
        Update: {
          stage?: string;
          status?: "pending" | "approved" | "changes_requested";
          feedback?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Relationships: [];
      };
      questionnaires: {
        Row: {
          id: string;
          customer_id: string;
          type: "hochschule" | "ausbildungsbetrieb";
          data: Record<string, unknown>;
          received_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type: "hochschule" | "ausbildungsbetrieb";
          data: Record<string, unknown>;
          received_at?: string;
          created_at?: string;
        };
        Update: {
          customer_id?: string;
          type?: "hochschule" | "ausbildungsbetrieb";
          data?: Record<string, unknown>;
          received_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type DefaultTask = {
  title: string;
  default_role: "cutter" | "scripter" | "sm_manager" | "backoffice" | null;
  estimated_minutes: number;
};

// Convenience type aliases
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Creator = Database["public"]["Tables"]["creators"]["Row"];
export type ProductType = Database["public"]["Tables"]["product_types"]["Row"];
export type ProcessTemplate = Database["public"]["Tables"]["process_templates"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type VideoProject = Database["public"]["Tables"]["video_projects"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Posting = Database["public"]["Tables"]["postings"]["Row"];
export type Approval = Database["public"]["Tables"]["approvals"]["Row"];
export type Questionnaire = Database["public"]["Tables"]["questionnaires"]["Row"];

// Extended types for views with joins
export type VideoProjectWithRelations = VideoProject & {
  customer: Pick<Customer, "id" | "name">;
  creator: Pick<Creator, "id" | "name" | "short_code" | "color"> | null;
  cutter: Pick<User, "id" | "name" | "avatar_url"> | null;
  scripter: Pick<User, "id" | "name" | "avatar_url"> | null;
  sm_manager: Pick<User, "id" | "name" | "avatar_url"> | null;
};

export type TaskWithProject = Task & {
  project: Pick<VideoProject, "id" | "title" | "status"> & {
    customer: Pick<Customer, "id" | "name">;
  };
};
