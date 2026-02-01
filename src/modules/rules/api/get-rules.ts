// src/modules/rules/api/get-rules.ts

import "server-only";

import { supabaseServer } from "@/infrastructure/supabase/server";

import type { Rule } from "../domain/rule.types";

type RuleRow = {
  id: string;
  user_id: string;
  is_enabled: boolean;
  priority: number;
  match_type: Rule["matchType"];
  pattern: string;
  apply_type: Rule["applyType"];
  account_id: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: RuleRow): Rule {
  return {
    id: row.id,
    userId: row.user_id,
    isEnabled: row.is_enabled,
    priority: row.priority,
    matchType: row.match_type,
    pattern: row.pattern,
    applyType: row.apply_type,
    accountId: row.account_id,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getRulesForCurrentUser(): Promise<Rule[]> {
  const supabase = await supabaseServer();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  const user = auth?.user;

  if (authError) throw new Error(`auth.getUser failed: ${authError.message}`);
  if (!user) return [];

  const { data, error } = await supabase
    .from("rules")
    .select(
      `id,user_id,is_enabled,priority,match_type,pattern,apply_type,account_id,category_id,created_at,updated_at`,
    )
    .eq("user_id", user.id)
    .order("is_enabled", { ascending: false })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`rules fetch failed: ${error.message}`);

  return ((data ?? []) as RuleRow[]).map(mapRow);
}
