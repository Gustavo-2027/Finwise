"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

import { updateTransactionSchema } from "../schemas/transaction-form.schema";

function parseFormData(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    type: String(formData.get("type") ?? "expense"),
    status: String(formData.get("status") ?? "posted"),
    accountId: String(formData.get("accountId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""), // "" = inbox
    date: String(formData.get("date") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function dateToIso(dateYYYYMMDD: string) {
  return new Date(`${dateYYYYMMDD}T12:00:00.000Z`).toISOString();
}

export async function updateTransactionAction(formData: FormData) {
  const raw = parseFormData(formData);
  const parsed = updateTransactionSchema.safeParse(raw);

  if (!parsed.success) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível salvar",
      description: parsed.error.issues[0]?.message ?? "Verifique os campos.",
    });
    redirect(`/transactions/${raw.id}/edit`);
  }

  const supabase = await supabaseServer();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth.user) {
    await setFlashToast({
      type: "error",
      title: "Sessão inválida",
      description: "Faça login novamente.",
    });
    redirect("/login");
  }

  const userId = auth.user.id;
  const input = parsed.data;

  const occurredAt = dateToIso(input.date);
  const amountCents = toCents(input.amount);
  const note = input.note?.trim() ? input.note.trim() : null;

  const { error } = await supabase
    .from("transactions")
    .update({
      title: input.title,
      type: input.type,
      status: input.status,
      account_id: input.accountId,
      category_id: input.categoryId, // pode ser null
      occurred_at: occurredAt,
      amount_cents: amountCents,
      note,
    })
    .eq("id", input.id)
    .eq("user_id", userId);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao salvar",
      description: error.message,
    });
    redirect(`/transactions/${input.id}/edit`);
  }

  await setFlashToast({ type: "success", title: "Transação atualizada" });

  // Mantém usuário em um estado previsível.
  redirect("/transactions?status=all");
}
