"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

/**
 * Converte "1.234,56" -> 1234.56 (number) antes do z.number()
 */
const moneyNumber = z.preprocess((val) => {
  const raw = String(val ?? "").trim();
  if (!raw) return NaN;

  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return n;
}, z.number().finite("Informe um valor válido.").positive("Informe um valor válido."));

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2, "Informe uma descrição."),
  amount: moneyNumber,
  type: z.enum(["income", "expense"]),
  accountId: z.string().uuid("Conta inválida."),
  categoryId: z.string().uuid("Categoria inválida."),
  date: z.string().min(10, "Data inválida."),
  note: z
    .string()
    .trim()
    .max(500, "Observação muito longa (máx. 500 caracteres).")
    .optional(),
});

function parseFormData(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
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
  return Math.round(amount * 100);
}

function dateToIso(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export async function updateTransactionAction(formData: FormData) {
  const raw = parseFormData(formData);
  const parsed = updateSchema.safeParse(raw);

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

  const input = parsed.data;

  const note = input.note?.trim();
  const occurredAt = dateToIso(input.date);
  const amountCents = toCents(input.amount);

  const { error } = await supabase
    .from("transactions")
    .update({
      title: input.title,
      type: input.type,
      account_id: input.accountId,
      category_id: input.categoryId,
      occurred_at: occurredAt,
      amount_cents: amountCents,
      note: note ? note : null,
    })
    .eq("id", input.id)
    .eq("user_id", auth.user.id);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao salvar",
      description: error.message,
    });
    redirect(`/transactions/${input.id}/edit`);
  }

  await setFlashToast({ type: "success", title: "Transação atualizada" });
  redirect("/transactions");
}
