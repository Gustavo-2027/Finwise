// src/modules/rules/actions/delete-rule.ts
"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

export async function deleteRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

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

  const { error } = await supabase
    .from("rules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível excluir",
      description: error.message,
    });
    redirect("/rules");
  }

  await setFlashToast({
    type: "success",
    title: "Regra excluída",
    description: "A regra foi removida com sucesso.",
  });

  redirect("/rules");
}
