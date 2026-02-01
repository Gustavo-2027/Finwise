"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { setFlashToast } from "@/shared/flash/flash-toast";

const deleteSchema = z.object({
  id: z.string().uuid(),
  confirm: z.enum(["on"], { message: "Confirme para excluir." }),
});

function parseFormData(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  };
}

export async function deleteTransactionAction(formData: FormData) {
  const raw = parseFormData(formData);
  const parsed = deleteSchema.safeParse(raw);

  if (!parsed.success) {
    await setFlashToast({
      type: "error",
      title: "Não foi possível excluir",
      description: parsed.error.issues[0]?.message ?? "Confirme para excluir.",
    });
    redirect(`/transactions/${raw.id}/edit`);
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

  const { id } = parsed.data;

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    await setFlashToast({
      type: "error",
      title: "Erro ao excluir",
      description: error.message,
    });
    redirect(`/transactions/${id}/edit`);
  }

  await setFlashToast({ type: "success", title: "Transação excluída" });
  redirect("/transactions");
}
