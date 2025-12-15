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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      about_section: {
        Row: {
          content_intro: string
          content_main: string
          id: string
          image_url: string
          skills: Json | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_intro: string
          content_main: string
          id?: string
          image_url: string
          skills?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          content_intro?: string
          content_main?: string
          id?: string
          image_url?: string
          skills?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          page_path: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          page_path?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          page_path?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          message: string
          name: string
          read_at: string | null
          read_by: string | null
          status: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          message: string
          name: string
          read_at?: string | null
          read_by?: string | null
          status?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          message?: string
          name?: string
          read_at?: string | null
          read_by?: string | null
          status?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          degree: string
          description: string
          display_order: number
          id: string
          institution: string
          status: string | null
          technologies: string[] | null
          updated_at: string | null
          year: string
        }
        Insert: {
          created_at?: string | null
          degree: string
          description: string
          display_order: number
          id?: string
          institution: string
          status?: string | null
          technologies?: string[] | null
          updated_at?: string | null
          year: string
        }
        Update: {
          created_at?: string | null
          degree?: string
          description?: string
          display_order?: number
          id?: string
          institution?: string
          status?: string | null
          technologies?: string[] | null
          updated_at?: string | null
          year?: string
        }
        Relationships: []
      }
      future_projects: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          features: string[] | null
          icon_name: string | null
          id: string
          project_status: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order: number
          features?: string[] | null
          icon_name?: string | null
          id?: string
          project_status?: string | null
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          features?: string[] | null
          icon_name?: string | null
          id?: string
          project_status?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_section: {
        Row: {
          background_overlay_opacity: number | null
          cta_primary_text: string | null
          cta_secondary_text: string | null
          description: string
          id: string
          name: string
          subtitle: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          background_overlay_opacity?: number | null
          cta_primary_text?: string | null
          cta_secondary_text?: string | null
          description: string
          id?: string
          name: string
          subtitle: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          background_overlay_opacity?: number | null
          cta_primary_text?: string | null
          cta_secondary_text?: string | null
          description?: string
          id?: string
          name?: string
          subtitle?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          features: string[]
          highlighted: boolean | null
          id: string
          name: string
          period: string
          price: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order: number
          features?: string[]
          highlighted?: boolean | null
          id?: string
          name: string
          period: string
          price: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          features?: string[]
          highlighted?: boolean | null
          id?: string
          name?: string
          period?: string
          price?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number
          id: string
          image_url: string
          project_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          image_url: string
          project_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          challenges: string
          created_at: string | null
          detailed_description: string
          display_order: number
          duration: string
          featured: boolean | null
          github_url: string | null
          id: string
          live_url: string | null
          role: string | null
          short_description: string
          status: string | null
          team_size: string | null
          technologies: string[] | null
          thumbnail_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          challenges: string
          created_at?: string | null
          detailed_description: string
          display_order: number
          duration: string
          featured?: boolean | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          role?: string | null
          short_description: string
          status?: string | null
          team_size?: string | null
          technologies?: string[] | null
          thumbnail_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          challenges?: string
          created_at?: string | null
          detailed_description?: string
          display_order?: number
          duration?: string
          featured?: boolean | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          role?: string | null
          short_description?: string
          status?: string | null
          team_size?: string | null
          technologies?: string[] | null
          thumbnail_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          favicon_url: string | null
          id: string
          logo_url: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          site_title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          site_title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          site_title?: string
          updated_at?: string | null
          updated_by?: string | null
<<<<<<< HEAD
=======
        }
        Relationships: []
      }
      skills_timeline: {
        Row: {
          category: string
          created_at: string | null
          description: string
          display_order: number
          icon: string | null
          id: string
          month: string | null
          project_link: string | null
          skills: string[] | null
          status: string | null
          title: string
          updated_at: string | null
          year: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          display_order?: number
          icon?: string | null
          id?: string
          month?: string | null
          project_link?: string | null
          skills?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
          year: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          display_order?: number
          icon?: string | null
          id?: string
          month?: string | null
          project_link?: string | null
          skills?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
          year?: string
        }
        Relationships: []
      }
      tech_stack: {
        Row: {
          category: string
          created_at: string | null
          description: string
          display_order: number
          experience_level: number
          icon: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          display_order?: number
          experience_level: number
          icon?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          display_order?: number
          experience_level?: number
          icon?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
>>>>>>> c8912d8 (Version 4 added new features and page)
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          display_order: number
          feedback: string
          id: string
          image_url: string
          name: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          feedback: string
          id?: string
          image_url: string
          name: string
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          feedback?: string
          id?: string
          image_url?: string
          name?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
