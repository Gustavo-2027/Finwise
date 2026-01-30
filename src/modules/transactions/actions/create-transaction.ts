"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

import { createTransactionSchema } from "../schemas/transaction-form.schema";

/**
 * Extrai e normaliza os dados vindos do <form>.
 * Obs: a conversão de amount (vírgula/milhar) deve estar no Zod schema.
 */
function parseFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    type: String(formData.get("type") ?? "expense"),
    accountId: String(formData.get("accountId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    date: String(formData.get("date") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
}

function toCents(amount: number) {
  // Evita bugs de float (ex: 0.1 + 0.2)
  return Math.round(amount * 100);
}

function dateToIso(date: string) {
  // yyyy-mm-dd -> UTC meia-noite (determinístico)
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export async function createTransactionAction(formData: FormData) {
  const raw = parseFormData(formData);
  const parsed = createTransactionSchema.safeParse(raw);

  if (!parsed.success) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível criar",
      description: parsed.error.issues[0]?.message ?? "Verifique os campos.",
    });
    redirect("/transactions/new");
  }

  const supabase = await supabaseServer();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  const user = auth?.user;

  if (authError || !user) {
    await setFlashToast({
      type: "error",
      title: "Sessão inválida",
      description: "Faça login novamente.",
    });
    redirect("/login");
  }

  const input = parsed.data;

  const note = input.note?.trim();
  const occurredAt = dateToIso(input.date);
  const amountCents = toCents(input.amount);

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,

    title: input.title,
    type: input.type,

    account_id: input.accountId,
    category_id: input.categoryId,

    occurred_at: occurredAt,
    amount_cents: amountCents,

    note: note ? note : null,
  });

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao salvar transação",
      description: error.message,
    });
    redirect("/transactions/new");
  }

  await setFlashToast({
    type: "success",
    title: "Transação criada",
    description: "Sua transação foi adicionada com sucesso.",
  });

  redirect("/transactions");
}
