"use server";

import { supabaseServer } from "@/infrastructure/supabase/server";

export interface LoginResult {
  ok: boolean;
  message?: string;
}

/**
 * Realiza login via email/senha usando Supabase.
 * Retorna apenas um status simples para a UI decidir o feedback.
 */
export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Não lança erro: a UI trata a mensagem
    return {
      ok: false,
      message: error.message,
    };
  }

  return { ok: true };
}
