"use server";

import { supabaseServer } from "@/infrastructure/supabase/server";

/**
 * Logout no server para limpar cookies e sessão.
 */
export async function logoutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
}
