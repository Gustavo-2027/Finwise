export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          is_archived: boolean;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_archived?: boolean;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_archived?: boolean;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          is_archived: boolean;
          kind: Database["public"]["Enums"]["transaction_type"];
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_archived?: boolean;
          kind: Database["public"]["Enums"]["transaction_type"];
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_archived?: boolean;
          kind?: Database["public"]["Enums"]["transaction_type"];
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      rules: {
        Row: {
          account_id: string | null;
          apply_type: Database["public"]["Enums"]["rule_apply_type"];
          category_id: string | null;
          created_at: string;
          id: string;
          is_enabled: boolean;
          match_type: Database["public"]["Enums"]["rule_match_type"];
          name: string | null;
          pattern: string;
          priority: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          apply_type?: Database["public"]["Enums"]["rule_apply_type"];
          category_id?: string | null;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          match_type: Database["public"]["Enums"]["rule_match_type"];
          name?: string | null;
          pattern: string;
          priority?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          apply_type?: Database["public"]["Enums"]["rule_apply_type"];
          category_id?: string | null;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          match_type?: Database["public"]["Enums"]["rule_match_type"];
          name?: string | null;
          pattern?: string;
          priority?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rules_account_id_user_id_fkey";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "rules_category_id_user_id_fkey";
            columns: ["category_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      transactions: {
        Row: {
          account_id: string;
          amount_cents: number;
          category_id: string | null;
          created_at: string;
          id: string;
          note: string | null;
          occurred_at: string;
          status: Database["public"]["Enums"]["transaction_status"];
          title: string;
          type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount_cents: number;
          category_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          occurred_at: string;
          status?: Database["public"]["Enums"]["transaction_status"];
          title: string;
          type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount_cents?: number;
          category_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          occurred_at?: string;
          status?: Database["public"]["Enums"]["transaction_status"];
          title?: string;
          type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_user_id_fkey";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_category_id_user_id_fkey";
            columns: ["category_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_transactions_summary: {
        Args: {
          p_end: string;
          p_q?: string;
          p_start: string;
          p_status?: string;
          p_type?: string;
        };
        Returns: {
          expense_cents: number;
          income_cents: number;
          net_cents: number;
          scheduled_expense_cents: number;
          scheduled_income_cents: number;
          scheduled_net_cents: number;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      rule_apply_type: "all" | "income" | "expense";
      rule_match_type: "contains" | "regex" | "starts_with" | "ends_with" | "equals";
      transaction_status: "posted" | "scheduled";
      transaction_type: "income" | "expense";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      rule_apply_type: ["all", "income", "expense"],
      rule_match_type: ["contains", "regex", "starts_with", "ends_with", "equals"],
      transaction_status: ["posted", "scheduled"],
      transaction_type: ["income", "expense"],
    },
  },
} as const;
