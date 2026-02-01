import { supabaseServer } from "@/infrastructure/supabase/server";
import type { Database } from "@/shared/types/database.types";

type RuleRow = Database["public"]["Tables"]["rules"]["Row"];

export async function getEnabledRulesForCurrentUser(): Promise<RuleRow[]> {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_enabled", true)
    .order("priority", { ascending: true });

  if (error || !data) return [];
  return data;
}
