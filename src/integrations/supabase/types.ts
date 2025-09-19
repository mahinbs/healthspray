export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_configs: {
        Row: {
          active: boolean
          created_at: string
          hindi_prompt: string
          id: string
          name: string
          personality_traits: Json | null
          scenario: string
          system_prompt: string
          updated_at: string
          voice_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          hindi_prompt: string
          id?: string
          name: string
          personality_traits?: Json | null
          scenario: string
          system_prompt: string
          updated_at?: string
          voice_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          hindi_prompt?: string
          id?: string
          name?: string
          personality_traits?: Json | null
          scenario?: string
          system_prompt?: string
          updated_at?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          audio_duration_ms: number | null
          call_id: string
          confidence_score: number | null
          id: string
          message_hindi: string | null
          message_text: string
          processing_time_ms: number | null
          speaker: string
          timestamp: string
        }
        Insert: {
          audio_duration_ms?: number | null
          call_id: string
          confidence_score?: number | null
          id?: string
          message_hindi?: string | null
          message_text: string
          processing_time_ms?: number | null
          speaker: string
          timestamp?: string
        }
        Update: {
          audio_duration_ms?: number | null
          call_id?: string
          confidence_score?: number | null
          id?: string
          message_hindi?: string | null
          message_text?: string
          processing_time_ms?: number | null
          speaker?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          audio_quality_score: number | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          scenario: string | null
          started_at: string
          status: string
          total_cost: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audio_quality_score?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          scenario?: string | null
          started_at?: string
          status?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audio_quality_score?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          scenario?: string | null
          started_at?: string
          status?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          approach: string | null
          before_after_images: string[] | null
          business_challenge: string | null
          case_study_images: string[] | null
          client_name: string | null
          client_testimonial: Json | null
          color_theme: string | null
          constraints: string | null
          created_at: string
          description: string | null
          executive_summary: string | null
          id: string
          implementation_steps: string[] | null
          industry: string | null
          is_public: boolean | null
          key_outcomes: string | null
          layout_style: string | null
          methodology: string | null
          metrics_achieved: Json | null
          mockup_template: string | null
          process_diagrams: string[] | null
          project_duration: string | null
          public_shared_at: string | null
          result_charts: string[] | null
          roi_data: Json | null
          solution_overview: string | null
          status: string
          success_metrics: Json | null
          team: string | null
          team_feedback: string | null
          technical_challenge: string | null
          title: string
          tools: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approach?: string | null
          before_after_images?: string[] | null
          business_challenge?: string | null
          case_study_images?: string[] | null
          client_name?: string | null
          client_testimonial?: Json | null
          color_theme?: string | null
          constraints?: string | null
          created_at?: string
          description?: string | null
          executive_summary?: string | null
          id?: string
          implementation_steps?: string[] | null
          industry?: string | null
          is_public?: boolean | null
          key_outcomes?: string | null
          layout_style?: string | null
          methodology?: string | null
          metrics_achieved?: Json | null
          mockup_template?: string | null
          process_diagrams?: string[] | null
          project_duration?: string | null
          public_shared_at?: string | null
          result_charts?: string[] | null
          roi_data?: Json | null
          solution_overview?: string | null
          status?: string
          success_metrics?: Json | null
          team?: string | null
          team_feedback?: string | null
          technical_challenge?: string | null
          title: string
          tools?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approach?: string | null
          before_after_images?: string[] | null
          business_challenge?: string | null
          case_study_images?: string[] | null
          client_name?: string | null
          client_testimonial?: Json | null
          color_theme?: string | null
          constraints?: string | null
          created_at?: string
          description?: string | null
          executive_summary?: string | null
          id?: string
          implementation_steps?: string[] | null
          industry?: string | null
          is_public?: boolean | null
          key_outcomes?: string | null
          layout_style?: string | null
          methodology?: string | null
          metrics_achieved?: Json | null
          mockup_template?: string | null
          process_diagrams?: string[] | null
          project_duration?: string | null
          public_shared_at?: string | null
          result_charts?: string[] | null
          roi_data?: Json | null
          solution_overview?: string | null
          status?: string
          success_metrics?: Json | null
          team?: string | null
          team_feedback?: string | null
          technical_challenge?: string | null
          title?: string
          tools?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_study_collaborations: {
        Row: {
          case_study_id: string
          created_at: string
          id: string
          message: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_study_id: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_study_id?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_study_reviews: {
        Row: {
          case_study_id: string
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_study_id: string
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_study_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          created_at: string
          field_description: string | null
          field_name: string
          field_options: Json | null
          field_order: number
          field_type: string
          id: string
          is_required: boolean
          placeholder: string | null
          section_id: string
        }
        Insert: {
          created_at?: string
          field_description?: string | null
          field_name: string
          field_options?: Json | null
          field_order: number
          field_type: string
          id?: string
          is_required?: boolean
          placeholder?: string | null
          section_id: string
        }
        Update: {
          created_at?: string
          field_description?: string | null
          field_name?: string
          field_options?: Json | null
          field_order?: number
          field_type?: string
          id?: string
          is_required?: boolean
          placeholder?: string | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_permissions: {
        Row: {
          form_id: string
          granted_at: string
          granted_by: string | null
          id: string
          permission_level: string
          user_email: string
        }
        Insert: {
          form_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_level?: string
          user_email: string
        }
        Update: {
          form_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_level?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_permissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "requirement_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sections: {
        Row: {
          created_at: string
          form_id: string
          id: string
          is_mandatory: boolean
          section_description: string | null
          section_name: string
          section_order: number
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          is_mandatory?: boolean
          section_description?: string | null
          section_name: string
          section_order: number
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          is_mandatory?: boolean
          section_description?: string | null
          section_name?: string
          section_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_sections_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "requirement_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string
          form_id: string
          id: string
          password: string | null
          status: string
          submitted_at: string | null
          submitted_by_email: string | null
          submitted_by_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          password?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          password?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "requirement_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_collaborations: {
        Row: {
          created_at: string
          id: string
          message: string | null
          portfolio_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          portfolio_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          portfolio_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_reviews: {
        Row: {
          created_at: string | null
          id: string
          portfolio_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          portfolio_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          portfolio_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          about_me: string | null
          certifications: Json | null
          color_theme: string | null
          contact_info: Json | null
          cover_image_url: string | null
          created_at: string
          custom_sections: Json | null
          description: string | null
          education: Json | null
          experience: Json | null
          featured_projects: string[] | null
          id: string
          is_public: boolean | null
          layout_style: string | null
          portfolio_images: string[] | null
          public_shared_at: string | null
          resume_url: string | null
          skills: string[] | null
          status: string
          theme: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          about_me?: string | null
          certifications?: Json | null
          color_theme?: string | null
          contact_info?: Json | null
          cover_image_url?: string | null
          created_at?: string
          custom_sections?: Json | null
          description?: string | null
          education?: Json | null
          experience?: Json | null
          featured_projects?: string[] | null
          id?: string
          is_public?: boolean | null
          layout_style?: string | null
          portfolio_images?: string[] | null
          public_shared_at?: string | null
          resume_url?: string | null
          skills?: string[] | null
          status?: string
          theme?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          about_me?: string | null
          certifications?: Json | null
          color_theme?: string | null
          contact_info?: Json | null
          cover_image_url?: string | null
          created_at?: string
          custom_sections?: Json | null
          description?: string | null
          education?: Json | null
          experience?: Json | null
          featured_projects?: string[] | null
          id?: string
          is_public?: boolean | null
          layout_style?: string | null
          portfolio_images?: string[] | null
          public_shared_at?: string | null
          resume_url?: string | null
          skills?: string[] | null
          status?: string
          theme?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          location: string | null
          profession: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          location?: string | null
          profession?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          location?: string | null
          profession?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      project_collaborations: {
        Row: {
          created_at: string
          id: string
          message: string | null
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          active_users: number | null
          app_store_url: string | null
          case_study_url: string | null
          challenges: string | null
          collaboration_type: string | null
          color_theme: string | null
          created_at: string
          current_version: string | null
          demo_url: string | null
          description: string | null
          future_vision: string | null
          github_url: string | null
          id: string
          industries: string[] | null
          is_public: boolean | null
          layout_style: string | null
          learnings: string | null
          metrics: Json | null
          mockup_template: string | null
          next_steps: string | null
          planned_features: string[] | null
          play_store_url: string | null
          problem: string | null
          project_images: string[] | null
          project_type: string | null
          public_shared_at: string | null
          solution: string | null
          status: string
          target_audience: string | null
          team: string | null
          testimonials: Json | null
          title: string
          tools: string[] | null
          updated_at: string
          usage_stats: Json | null
          use_cases: string[] | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          active_users?: number | null
          app_store_url?: string | null
          case_study_url?: string | null
          challenges?: string | null
          collaboration_type?: string | null
          color_theme?: string | null
          created_at?: string
          current_version?: string | null
          demo_url?: string | null
          description?: string | null
          future_vision?: string | null
          github_url?: string | null
          id?: string
          industries?: string[] | null
          is_public?: boolean | null
          layout_style?: string | null
          learnings?: string | null
          metrics?: Json | null
          mockup_template?: string | null
          next_steps?: string | null
          planned_features?: string[] | null
          play_store_url?: string | null
          problem?: string | null
          project_images?: string[] | null
          project_type?: string | null
          public_shared_at?: string | null
          solution?: string | null
          status?: string
          target_audience?: string | null
          team?: string | null
          testimonials?: Json | null
          title: string
          tools?: string[] | null
          updated_at?: string
          usage_stats?: Json | null
          use_cases?: string[] | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          active_users?: number | null
          app_store_url?: string | null
          case_study_url?: string | null
          challenges?: string | null
          collaboration_type?: string | null
          color_theme?: string | null
          created_at?: string
          current_version?: string | null
          demo_url?: string | null
          description?: string | null
          future_vision?: string | null
          github_url?: string | null
          id?: string
          industries?: string[] | null
          is_public?: boolean | null
          layout_style?: string | null
          learnings?: string | null
          metrics?: Json | null
          mockup_template?: string | null
          next_steps?: string | null
          planned_features?: string[] | null
          play_store_url?: string | null
          problem?: string | null
          project_images?: string[] | null
          project_type?: string | null
          public_shared_at?: string | null
          solution?: string | null
          status?: string
          target_audience?: string | null
          team?: string | null
          testimonials?: Json | null
          title?: string
          tools?: string[] | null
          updated_at?: string
          usage_stats?: Json | null
          use_cases?: string[] | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      requirement_forms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          template_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          template_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          template_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      submission_data: {
        Row: {
          field_id: string
          field_value: string | null
          id: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          field_id: string
          field_value?: string | null
          id?: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          field_id?: string
          field_value?: string | null
          id?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_data_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_data_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      submission_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          changed_by_name: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          submission_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          submission_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          submission_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_case_study_collaborations: {
        Args: { case_study_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          message: string
          profession: string
          status: string
          user_id: string
        }[]
      }
      get_case_study_reviews: {
        Args: { case_study_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          rating: number
          review_text: string
          user_id: string
        }[]
      }
      get_portfolio_collaborations: {
        Args: { portfolio_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          message: string
          profession: string
          status: string
          user_id: string
        }[]
      }
      get_portfolio_reviews: {
        Args: { portfolio_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          rating: number
          review_text: string
          user_id: string
        }[]
      }
      get_project_collaborations: {
        Args: { project_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          message: string
          profession: string
          status: string
          user_id: string
        }[]
      }
      get_project_reviews: {
        Args: { project_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
          rating: number
          review_text: string
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
