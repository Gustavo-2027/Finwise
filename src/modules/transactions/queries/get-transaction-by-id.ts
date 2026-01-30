import { supabaseServer } from "@/infrastructure/supabase/server";

export type TransactionEditData = {
  id: string;
  title: string;
  type: "income" | "expense";
  accountId: string;
  categoryId: string;
  occurredAt: string;
  amountCents: number;
  note: string | null;
};

export async function getTransactionById(
  id: string,
): Promise<{ ok: true; data: TransactionEditData } | { ok: false; message: string }> {
  const supabase = await supabaseServer();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  const user = auth?.user;

  if (authError || !user) {
    return { ok: false, message: "Sessão inválida." };
  }

  // ⚠️ Se id estiver vazio/undefined, isso já explica tudo
  if (!id || id === "undefined" || id === "null") {
    return { ok: false, message: `ID inválido recebido: "${id}"` };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("id,title,type,account_id,category_id,occurred_at,amount_cents,note")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle(); // melhor que single() pra debug

  if (error) {
    // Aqui vem o erro real: invalid uuid / RLS / etc.
    return { ok: false, message: error.message };
  }

  if (!data) {
    return {
      ok: false,
      message: "Nenhuma linha encontrada para este ID (ou não pertence ao usuário).",
    };
  }

  return {
    ok: true,
    data: {
      id: data.id,
      title: data.title,
      type: data.type,
      accountId: data.account_id,
      categoryId: data.category_id,
      occurredAt: data.occurred_at,
      amountCents: Number(data.amount_cents),
      note: data.note ?? null,
    },
  };
}
