// src/modules/rules/actions/create-rule.ts
"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

import { ruleFormSchema } from "../schemas/rule.schema";

function emptyToNull(value: unknown) {
  const v = String(value ?? "").trim();
  return v.length > 0 ? v : null;
}

export async function createRuleAction(formData: FormData) {
  const raw = {
    isEnabled: formData.get("isEnabled"),
    priority: formData.get("priority"),
    matchType: formData.get("matchType"),
    pattern: formData.get("pattern"),
    applyType: formData.get("applyType"),
    accountId: emptyToNull(formData.get("accountId")),
    categoryId: emptyToNull(formData.get("categoryId")),
  };

  const parsed = ruleFormSchema.safeParse(raw);

  if (!parsed.success) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível criar a regra",
      description: parsed.error.issues[0]?.message ?? "Verifique os campos.",
    });
    redirect("/rules");
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

  const { error } = await supabase.from("rules").insert({
    user_id: user.id,
    is_enabled: input.isEnabled,
    priority: input.priority,
    match_type: input.matchType,
    pattern: input.pattern,
    apply_type: input.applyType,
    account_id: input.accountId ?? null,
    category_id: input.categoryId ?? null,
  });

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao salvar regra",
      description: error.message,
    });
    redirect("/rules");
  }

  await setFlashToast({
    type: "success",
    title: "Regra criada",
    description: "A regra foi salva e já pode ser aplicada automaticamente.",
  });

  redirect("/rules");
}
