"use server";

import { supabaseServer } from "@/infrastructure/supabase/server";

export interface RegisterData {
  email: string;
  password: string;
}

/**
 * Cria conta no Supabase.
 * Obs: se "Confirm email" estiver ligado no Supabase, o usuário só loga após confirmar.
 */
export async function registerAction(data: RegisterData) {
  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const };
}
