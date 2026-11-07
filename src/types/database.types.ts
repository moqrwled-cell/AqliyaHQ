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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      battle_logs: {
        Row: {
          created_at: string | null
          details: string | null
          entry_type: string
          id: string
          mission_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          entry_type: string
          id?: string
          mission_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          entry_type?: string
          id?: string
          mission_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_logs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: []
      }
      commander_dossier: {
        Row: {
          active_focus: string | null
          callsign: string | null
          core_skills: string[] | null
          decision_principles: string[] | null
          id: string
          life_history_summary: string | null
          updated_at: string | null
          vision_statement: string | null
        }
        Insert: {
          active_focus?: string | null
          callsign?: string | null
          core_skills?: string[] | null
          decision_principles?: string[] | null
          id?: string
          life_history_summary?: string | null
          updated_at?: string | null
          vision_statement?: string | null
        }
        Update: {
          active_focus?: string | null
          callsign?: string | null
          core_skills?: string[] | null
          decision_principles?: string[] | null
          id?: string
          life_history_summary?: string | null
          updated_at?: string | null
          vision_statement?: string | null
        }
        Relationships: []
      }
      commander_memories: {
        Row: {
          content: string
          context_tags: string[] | null
          created_at: string | null
          id: string
          importance: number | null
          memory_type: string
          mission_id: string | null
        }
        Insert: {
          content: string
          context_tags?: string[] | null
          created_at?: string | null
          id?: string
          importance?: number | null
          memory_type: string
          mission_id?: string | null
        }
        Update: {
          content?: string
          context_tags?: string[] | null
          created_at?: string | null
          id?: string
          importance?: number | null
          memory_type?: string
          mission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commander_memories_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      intel_depot: {
        Row: {
          category: string
          created_at: string | null
          id: string
          key_takeaways: string | null
          mission_id: string | null
          platform: string | null
          problem_solved: string | null
          status: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          key_takeaways?: string | null
          mission_id?: string | null
          platform?: string | null
          problem_solved?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          key_takeaways?: string | null
          mission_id?: string | null
          platform?: string | null
          problem_solved?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "intel_depot_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          code: string
          created_at: string | null
          current_focus: string | null
          description: string | null
          done_log: Json | null
          github_repo: string | null
          id: string
          next_ops: string | null
          progress_percent: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_focus?: string | null
          description?: string | null
          done_log?: Json | null
          github_repo?: string | null
          id?: string
          next_ops?: string | null
          progress_percent?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_focus?: string | null
          description?: string | null
          done_log?: Json | null
          github_repo?: string | null
          id?: string
          next_ops?: string | null
          progress_percent?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      network_edges: {
        Row: {
          created_at: string | null
          id: string
          relationship: string | null
          source_id: string
          target_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          relationship?: string | null
          source_id: string
          target_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          relationship?: string | null
          source_id?: string
          target_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "network_edges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "network_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_edges_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "network_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      network_nodes: {
        Row: {
          created_at: string | null
          id: string
          label: string
          metadata: Json | null
          node_type: string
          x: number | null
          y: number | null
        }
        Insert: {
          created_at?: string | null
          id: string
          label: string
          metadata?: Json | null
          node_type?: string
          x?: number | null
          y?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          metadata?: Json | null
          node_type?: string
          x?: number | null
          y?: number | null
        }
        Relationships: []
      }
      strategic_directives: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          pillar: string | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          pillar?: string | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          pillar?: string | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
