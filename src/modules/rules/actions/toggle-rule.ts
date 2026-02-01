// src/modules/rules/actions/toggle-rule.ts
"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

export async function toggleRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const nextEnabled = String(formData.get("nextEnabled") ?? "").trim() === "true";

  if (!id) {
    await setFlashToast({
      type: "error",
      title: "Ação inválida",
      description: "Regra não encontrada.",
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

  // Segurança extra além do RLS: também filtra por user_id.
  const { error } = await supabase
    .from("rules")
    .update({ is_enabled: nextEnabled })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível atualizar",
      description: error.message,
    });
    redirect("/rules");
  }

  await setFlashToast({
    type: "success",
    title: "Regra atualizada",
    description: nextEnabled ? "Regra ativada." : "Regra desativada.",
  });

  redirect("/rules");
}
