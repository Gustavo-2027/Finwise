"use server";

import { supabaseServer } from "@/infrastructure/supabase/server";
import type { CreateTransactionData } from "@/modules/transactions/types";

export async function createTransactionAction(data: CreateTransactionData) {
  const supabase = await supabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false as const, message: "Sessão inválida. Faça login novamente." };
  }

  // Validação mínima no server (não confia só no client)
  if (!data.title.trim()) {
    return { ok: false as const, message: "Informe uma descrição." };
  }

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    return { ok: false as const, message: "Informe um valor válido." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    title: data.title.trim(),
    amount: data.amount,
    type: data.type,
    category: data.category.trim(),
    account: data.account.trim(),
    date: data.date,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const };
}
