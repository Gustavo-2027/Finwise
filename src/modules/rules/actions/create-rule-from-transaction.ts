"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";
import type { Database } from "@/shared/types/database.types";

type RuleInsert = Database["public"]["Tables"]["rules"]["Insert"];

const schema = z.object({
  // OBS: sua tabela "rules" não tem coluna "name"
  // então usamos pattern como referência obrigatória e tudo bem.
  pattern: z.string().trim().min(2, "Informe um padrão (mín. 2 caracteres)."),

  match_type: z.enum(["contains", "regex", "starts_with", "ends_with", "equals"]),
  apply_type: z.enum(["all", "income", "expense"]).default("all"),

  // opcionais
  account_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});

function toNullIfEmpty(v: unknown) {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}

function parse(formData: FormData) {
  return {
    // ✅ snake_case (igual ao que você setou no form)
    pattern: String(formData.get("pattern") ?? ""),
    match_type: String(formData.get("match_type") ?? "contains"),
    apply_type: String(formData.get("apply_type") ?? "all"),

    account_id: toNullIfEmpty(formData.get("account_id")),
    category_id: toNullIfEmpty(formData.get("category_id")),
  };
}

export async function createRuleFromTransactionAction(formData: FormData) {
  const raw = parse(formData);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível criar regra",
      description: parsed.error.issues[0]?.message ?? "Verifique os campos.",
    });
    redirect("/transactions");
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

  const payload: RuleInsert = {
    user_id: auth.user.id,

    is_enabled: true,
    priority: 100,

    match_type: input.match_type,
    pattern: input.pattern,
    apply_type: input.apply_type,

    account_id: input.account_id ?? null,
    category_id: input.category_id ?? null,
  };

  const { error } = await supabase.from("rules").insert(payload);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao criar regra",
      description: error.message,
    });
    redirect("/transactions");
  }

  await setFlashToast({
    type: "success",
    title: "Regra criada",
    description:
      "Agora a Valette pode categorizar automaticamente transações semelhantes.",
  });

  redirect("/rules");
}
