// src/modules/rules/queries/get-rule-form-options.ts

import "server-only";

import { supabaseServer } from "@/infrastructure/supabase/server";

export interface RuleFormOption {
  id: string;
  name: string;
}

export interface RuleFormOptions {
  accounts: RuleFormOption[];
  categories: RuleFormOption[];
}

/**
 * Busca opções para os Selects de Rules (contas e categorias).
 * Mantém isso no módulo rules pra não acoplar com transactions.
 */
export async function getRuleFormOptions(): Promise<RuleFormOptions> {
  const supabase = await supabaseServer();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  const user = auth?.user;

  if (authError) throw new Error(`auth.getUser failed: ${authError.message}`);
  if (!user) return { accounts: [], categories: [] };

  const [accountsRes, categoriesRes] = await Promise.all([
    supabase
      .from("accounts")
      .select("id,name")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),

    supabase
      .from("categories")
      .select("id,name")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
  ]);

  if (accountsRes.error) {
    throw new Error(`accounts fetch failed: ${accountsRes.error.message}`);
  }
  if (categoriesRes.error) {
    throw new Error(`categories fetch failed: ${categoriesRes.error.message}`);
  }

  return {
    accounts: (accountsRes.data ?? []) as RuleFormOption[],
    categories: (categoriesRes.data ?? []) as RuleFormOption[],
  };
}
