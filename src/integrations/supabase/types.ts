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
      announcements: {
        Row: {
          content: string | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          start_date: string | null
          title: string
          type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          title: string
          type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          department_id: string
          doctor_id: string
          end_time: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          time_slot_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          department_id: string
          doctor_id: string
          end_time: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          time_slot_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          department_id?: string
          doctor_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          time_slot_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_read: boolean
          message: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_read?: boolean
          message: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_read?: boolean
          message?: string
          subject?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          category: Database["public"]["Enums"]["department_category"]
          created_at: string
          description_en: string | null
          description_mk: string | null
          description_sq: string | null
          email: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_en: string
          name_mk: string | null
          name_sq: string | null
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["department_category"]
          created_at?: string
          description_en?: string | null
          description_mk?: string | null
          description_sq?: string | null
          email?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en: string
          name_mk?: string | null
          name_sq?: string | null
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["department_category"]
          created_at?: string
          description_en?: string | null
          description_mk?: string | null
          description_sq?: string | null
          email?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en?: string
          name_mk?: string | null
          name_sq?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          created_at: string
          department_id: string
          email: string | null
          full_name: string
          id: string
          image_url: string | null
          is_active: boolean
          phone: string | null
          specialization: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department_id: string
          email?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          phone?: string | null
          specialization?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          department_id?: string
          email?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          phone?: string | null
          specialization?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          appointment_id: string | null
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          doctor_id: string | null
          file_type: string | null
          file_url: string
          id: string
          patient_id: string
          title: string
        }
        Insert: {
          appointment_id?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          doctor_id?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          patient_id: string
          title: string
        }
        Update: {
          appointment_id?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          doctor_id?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          patient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      er_wait_times: {
        Row: {
          current_wait_minutes: number
          department: string
          id: string
          patient_count: number
          severity_level: string | null
          updated_at: string
        }
        Insert: {
          current_wait_minutes?: number
          department: string
          id?: string
          patient_count?: number
          severity_level?: string | null
          updated_at?: string
        }
        Update: {
          current_wait_minutes?: number
          department?: string
          id?: string
          patient_count?: number
          severity_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          department_id: string | null
          id: string
          is_anonymous: boolean
          patient_id: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          is_anonymous?: boolean
          patient_id?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          is_anonymous?: boolean
          patient_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          appointment_id: string | null
          created_at: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          reference_range: string | null
          result_value: string | null
          status: Database["public"]["Enums"]["lab_result_status"]
          test_category: string | null
          test_name: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reference_range?: string | null
          result_value?: string | null
          status?: Database["public"]["Enums"]["lab_result_status"]
          test_category?: string | null
          test_name: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reference_range?: string | null
          result_value?: string | null
          status?: Database["public"]["Enums"]["lab_result_status"]
          test_category?: string | null
          test_name?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_history: {
        Row: {
          condition: string
          created_at: string
          diagnosis_date: string | null
          doctor_id: string | null
          id: string
          is_active: boolean
          notes: string | null
          patient_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosis_date?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosis_date?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          category: Database["public"]["Enums"]["news_category"]
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: Database["public"]["Enums"]["news_category"]
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      partner_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string
          doctor_id: string | null
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          medication_name: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["prescription_status"]
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_documents: {
        Row: {
          category: Database["public"]["Enums"]["procurement_category"]
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          published_at: string | null
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["procurement_category"]
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          published_at?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["procurement_category"]
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          published_at?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string | null
          recommended_department_id: string | null
          severity: string | null
          symptoms: Json
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          recommended_department_id?: string | null
          severity?: string | null
          symptoms?: Json
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          recommended_department_id?: string | null
          severity?: string | null
          symptoms?: Json
        }
        Relationships: [
          {
            foreignKeyName: "symptom_logs_recommended_department_id_fkey"
            columns: ["recommended_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean
          slot_date: string
          start_time: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean
          slot_date: string
          start_time: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean
          slot_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "doctor" | "nurse" | "receptionist" | "patient"
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      department_category:
        | "Surgery"
        | "Internal"
        | "Diagnostics"
        | "Emergency"
        | "Specialized"
      document_category:
        | "lab_report"
        | "imaging"
        | "discharge_summary"
        | "referral"
        | "consent_form"
        | "other"
      lab_result_status: "pending" | "completed" | "reviewed"
      news_category:
        | "hospital_news"
        | "health_tips"
        | "events"
        | "announcements"
      notification_type:
        | "appointment"
        | "lab_result"
        | "message"
        | "system"
        | "emergency"
      prescription_status: "active" | "completed" | "cancelled"
      procurement_category:
        | "documents"
        | "budget"
        | "quarterly_reports"
        | "annual_financial_reports"
        | "internal_job_listings"
        | "annual_procurement_plan"
        | "procurement_announcements"
        | "patient_rights"
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
      app_role: ["admin", "doctor", "nurse", "receptionist", "patient"],
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      department_category: [
        "Surgery",
        "Internal",
        "Diagnostics",
        "Emergency",
        "Specialized",
      ],
      document_category: [
        "lab_report",
        "imaging",
        "discharge_summary",
        "referral",
        "consent_form",
        "other",
      ],
      lab_result_status: ["pending", "completed", "reviewed"],
      news_category: [
        "hospital_news",
        "health_tips",
        "events",
        "announcements",
      ],
      notification_type: [
        "appointment",
        "lab_result",
        "message",
        "system",
        "emergency",
      ],
      prescription_status: ["active", "completed", "cancelled"],
      procurement_category: [
        "documents",
        "budget",
        "quarterly_reports",
        "annual_financial_reports",
        "internal_job_listings",
        "annual_procurement_plan",
        "procurement_announcements",
        "patient_rights",
      ],
    },
  },
} as const
