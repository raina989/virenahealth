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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cycle_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          notes: string | null
          phase: string
          symptoms: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          phase: string
          symptoms?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          phase?: string
          symptoms?: string[]
          user_id?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          created_at: string
          energy: number | null
          id: string
          log_date: string
          mood: string | null
          notes: string | null
          sleep_end: string | null
          sleep_hours: number | null
          sleep_start: string | null
          symptoms: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          notes?: string | null
          sleep_end?: string | null
          sleep_hours?: number | null
          sleep_start?: string | null
          symptoms?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          notes?: string | null
          sleep_end?: string | null
          sleep_hours?: number | null
          sleep_start?: string | null
          symptoms?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number
          carbs: number
          fats: number
          id: string
          items: Json
          logged_at: string
          logged_on: string
          meal_slot: string
          mode: string
          protein: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          fats?: number
          id?: string
          items?: Json
          logged_at?: string
          logged_on?: string
          meal_slot?: string
          mode?: string
          protein?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          fats?: number
          id?: string
          items?: Json
          logged_at?: string
          logged_on?: string
          meal_slot?: string
          mode?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      period_days: {
        Row: {
          created_at: string
          day: string
          flow: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          flow?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          flow?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          created_at: string
          default_mode: string
          dietary_pattern: string | null
          display_name: string | null
          email: string | null
          focus_areas: string[]
          has_pcos: boolean
          id: string
          onboarding_complete: boolean
          primary_goal: string | null
          tracks_cycle: boolean
          updated_at: string
        }
        Insert: {
          activity_level?: string | null
          created_at?: string
          default_mode?: string
          dietary_pattern?: string | null
          display_name?: string | null
          email?: string | null
          focus_areas?: string[]
          has_pcos?: boolean
          id: string
          onboarding_complete?: boolean
          primary_goal?: string | null
          tracks_cycle?: boolean
          updated_at?: string
        }
        Update: {
          activity_level?: string | null
          created_at?: string
          default_mode?: string
          dietary_pattern?: string | null
          display_name?: string | null
          email?: string | null
          focus_areas?: string[]
          has_pcos?: boolean
          id?: string
          onboarding_complete?: boolean
          primary_goal?: string | null
          tracks_cycle?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      swap_feedback: {
        Row: {
          chosen_name: string
          closeness_rating: number | null
          created_at: string
          id: string
          made_it: boolean | null
          original_name: string
          priority: string | null
          swap_key: string
          taste_rating: number | null
          user_id: string
          would_repeat: string | null
        }
        Insert: {
          chosen_name: string
          closeness_rating?: number | null
          created_at?: string
          id?: string
          made_it?: boolean | null
          original_name: string
          priority?: string | null
          swap_key: string
          taste_rating?: number | null
          user_id: string
          would_repeat?: string | null
        }
        Update: {
          chosen_name?: string
          closeness_rating?: number | null
          created_at?: string
          id?: string
          made_it?: boolean | null
          original_name?: string
          priority?: string | null
          swap_key?: string
          taste_rating?: number | null
          user_id?: string
          would_repeat?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
