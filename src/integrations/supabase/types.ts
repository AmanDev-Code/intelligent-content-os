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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_config: {
        Row: {
          enable_carousel: boolean
          enable_images: boolean
          id: string
          max_tokens: number
          model_name: string
          temperature: number
          updated_at: string
        }
        Insert: {
          enable_carousel?: boolean
          enable_images?: boolean
          id?: string
          max_tokens?: number
          model_name?: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          enable_carousel?: boolean
          enable_images?: boolean
          id?: string
          max_tokens?: number
          model_name?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          config: Json
          enabled: boolean
          key: string
        }
        Insert: {
          config?: Json
          enabled?: boolean
          key: string
        }
        Update: {
          config?: Json
          enabled?: boolean
          key?: string
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          ai_reasoning: string | null
          ai_score: number | null
          carousel_urls: string[] | null
          category_id: string | null
          content: string
          created_at: string
          deleted_at: string | null
          hashtags: string[] | null
          id: string
          linkedin_post_url: string | null
          performance_prediction: Json | null
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          suggested_improvements: string[] | null
          title: string
          updated_at: string
          user_id: string
          visual_type: string | null
          visual_url: string | null
        }
        Insert: {
          ai_reasoning?: string | null
          ai_score?: number | null
          carousel_urls?: string[] | null
          category_id?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          hashtags?: string[] | null
          id?: string
          linkedin_post_url?: string | null
          performance_prediction?: Json | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          suggested_improvements?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          visual_type?: string | null
          visual_url?: string | null
        }
        Update: {
          ai_reasoning?: string | null
          ai_score?: number | null
          carousel_urls?: string[] | null
          category_id?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          hashtags?: string[] | null
          id?: string
          linkedin_post_url?: string | null
          performance_prediction?: Json | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          suggested_improvements?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          visual_type?: string | null
          visual_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          content_id: string | null
          created_at: string
          current_stage: string | null
          error: string | null
          id: string
          progress: number
          response: Json | null
          retry_count: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          current_stage?: string | null
          error?: string | null
          id?: string
          progress?: number
          response?: Json | null
          retry_count?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string
          current_stage?: string | null
          error?: string | null
          id?: string
          progress?: number
          response?: Json | null
          retry_count?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_logs: {
        Row: {
          content_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          retry_count: number
          stages: Json | null
          status: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          retry_count?: number
          stages?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          retry_count?: number
          stages?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_remaining: number
          daily_credits_reset_at: string
          daily_credits_used: number
          full_name: string | null
          id: string
          linkedin_access_token: string | null
          linkedin_expires_at: string | null
          linkedin_refresh_token: string | null
          monthly_credits: number
          plan: string
          preferences: Json | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number
          daily_credits_reset_at?: string
          daily_credits_used?: number
          full_name?: string | null
          id: string
          linkedin_access_token?: string | null
          linkedin_expires_at?: string | null
          linkedin_refresh_token?: string | null
          monthly_credits?: number
          plan?: string
          preferences?: Json | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number
          daily_credits_reset_at?: string
          daily_credits_used?: number
          full_name?: string | null
          id?: string
          linkedin_access_token?: string | null
          linkedin_expires_at?: string | null
          linkedin_refresh_token?: string | null
          monthly_credits?: number
          plan?: string
          preferences?: Json | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          created_at: string
          credits_used: number
          date: string
          generations_count: number
          id: string
          publications_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          date?: string
          generations_count?: number
          id?: string
          publications_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          date?: string
          generations_count?: number
          id?: string
          publications_count?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      content_status: "draft" | "generating" | "ready" | "posted" | "failed"
      subscription_status: "active" | "past_due" | "cancelled" | "trialing"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      content_status: ["draft", "generating", "ready", "posted", "failed"],
      subscription_status: ["active", "past_due", "cancelled", "trialing"],
    },
  },
} as const
