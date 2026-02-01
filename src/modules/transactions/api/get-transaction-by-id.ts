import { supabaseServer } from "@/infrastructure/supabase/server";

export type GetTransactionByIdOk = {
  ok: true;
  data: {
    id: string;
    title: string;
    type: "income" | "expense";
    occurredAt: string;
    amountCents: number;

    accountId: string;
    accountName: string;

    categoryId: string | null;
    categoryName: string;

    note: string | null;
  };
};

export type GetTransactionByIdErr = { ok: false; message: string };
export type GetTransactionByIdResponse = GetTransactionByIdOk | GetTransactionByIdErr;

type DbTransactionRow = {
  id: string;
  title: string;
  type: "income" | "expense";
  occurred_at: string;
  amount_cents: number | string;

  account_id: string;
  category_id: string | null;

  note: string | null;

  account: { name: string } | null;
  category: { name: string } | null;
};

const SELECT_TRANSACTION_BY_ID = `
  id,
  title,
  type,
  occurred_at,
  amount_cents,
  account_id,
  category_id,
  note,
  account:accounts!transactions_account_id_user_id_fkey ( name ),
  category:categories!transactions_category_id_user_id_fkey ( name )
`;

function toInt(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
}

export async function getTransactionById(
  id: string,
): Promise<GetTransactionByIdResponse> {
  if (!id || id === "undefined") {
    return { ok: false, message: `ID inválido recebido: "${id}"` };
  }

  const supabase = await supabaseServer();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    return { ok: false, message: "Sessão inválida. Faça login novamente." };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(SELECT_TRANSACTION_BY_ID)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<DbTransactionRow | null>();

  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: "Transação não encontrada." };

  const categoryId = data.category_id ?? null;

  return {
    ok: true,
    data: {
      id: data.id,
      title: data.title,
      type: data.type,
      occurredAt: data.occurred_at,
      amountCents: toInt(data.amount_cents),

      accountId: data.account_id,
      accountName: data.account?.name ?? "—",

      categoryId,
      categoryName: categoryId ? (data.category?.name ?? "—") : "Inbox",

      note: data.note ?? null,
    },
  };
}
