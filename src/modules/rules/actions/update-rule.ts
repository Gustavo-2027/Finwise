// src/modules/rules/actions/update-rule.ts
"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

import { ruleFormSchema } from "../schemas/rule.schema";

/**
 * Converte valores "sentinel" do Select em null.
 * - account: "__all__" => null
 * - category: "__none__" => null
 */
function selectValueToNull(value: unknown, nullSentinel: string) {
  const v = String(value ?? "").trim();
  if (!v) return null;
  if (v === nullSentinel) return null;
  return v;
}

export async function updateRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    await setFlashToast({
      type: "error",
      title: "Ação inválida",
      description: "Regra não encontrada.",
    });
    redirect("/rules");
  }

  const raw = {
    isEnabled: formData.get("isEnabled"),
    priority: formData.get("priority"),

    matchType: formData.get("matchType"),
    pattern: formData.get("pattern"),

    applyType: formData.get("applyType"),

    accountId: selectValueToNull(formData.get("accountId"), "__all__"),
    categoryId: selectValueToNull(formData.get("categoryId"), "__none__"),
  };

  const parsed = ruleFormSchema.safeParse(raw);

  if (!parsed.success) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível salvar",
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

  const { error } = await supabase
    .from("rules")
    .update({
      is_enabled: input.isEnabled,
      priority: input.priority,
      match_type: input.matchType,
      pattern: input.pattern,
      apply_type: input.applyType,
      account_id: input.accountId ?? null,
      category_id: input.categoryId ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao atualizar regra",
      description: error.message,
    });
    redirect("/rules");
  }

  await setFlashToast({
    type: "success",
    title: "Regra atualizada",
    description: "As alterações foram salvas com sucesso.",
  });

  redirect("/rules");
}
