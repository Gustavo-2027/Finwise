"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { getEnabledRulesForCurrentUser } from "@/modules/rules/api/get-enabled-rules";
import { applyRulesToTransaction } from "@/modules/rules/domain/apply-rules-to-transaction";
import { setFlashToast } from "@/shared/flash/flash-toast";
import type { Database } from "@/shared/types/database.types";

import { createTransactionSchema } from "../schemas/transaction-form.schema";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

function parseFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    type: String(formData.get("type") ?? "expense"),
    status: String(formData.get("status") ?? "posted"),
    accountId: String(formData.get("accountId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""), // "" = inbox
    date: String(formData.get("date") ?? ""), // YYYY-MM-DD
    note: String(formData.get("note") ?? ""),
  };
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

/**
 * Usar 12:00Z evita “voltar um dia” em -03.
 * Padrão seguro para campos date.
 */
function dateToIso(dateYYYYMMDD: string) {
  return new Date(`${dateYYYYMMDD}T12:00:00.000Z`).toISOString();
}

function toNullIfEmpty(value: unknown) {
  const v = String(value ?? "").trim();
  return v.length > 0 ? v : null;
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

  const accountId = toNullIfEmpty(input.accountId);
  if (!accountId) {
    await setFlashToast({
      type: "error",
      title: "Conta obrigatória",
      description: "Selecione uma conta para registrar a transação.",
    });
    redirect("/transactions/new");
  }

  const occurredAt = dateToIso(String(input.date).trim());
  if (Number.isNaN(Date.parse(occurredAt))) {
    await setFlashToast({
      type: "error",
      title: "Data inválida",
      description: "Informe uma data válida.",
    });
    redirect("/transactions/new");
  }

  const amountCents = toCents(input.amount);
  const note = input.note?.trim() ? input.note.trim() : null;

  // "" -> null
  const categoryIdManual = toNullIfEmpty(input.categoryId);

  let finalCategoryId: string | null = categoryIdManual;

  // Só aplica regras se usuário não escolheu categoria manualmente.
  if (!finalCategoryId) {
    try {
      const rules = await getEnabledRulesForCurrentUser();
      const ruleResult = applyRulesToTransaction(
        {
          description: input.title,
          type: input.type,
          accountId,
          categoryId: null,
        },
        rules,
      );

      finalCategoryId = ruleResult.categoryId ?? null;
    } catch {
      finalCategoryId = null;
    }
  }

  const payload: TransactionInsert = {
    user_id: userId,
    title: input.title,
    type: input.type,
    status: input.status,

    account_id: accountId,
    category_id: finalCategoryId,

    occurred_at: occurredAt,
    amount_cents: amountCents,

    note,
  };

  const { error } = await supabase.from("transactions").insert(payload);
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

  // Evita usuário “preso” em status anterior.
  const yyyymm = input.date.slice(0, 7);
  redirect(`/transactions?month=${yyyymm}&status=all`);
}
