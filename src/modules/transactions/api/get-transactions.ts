import { supabaseServer } from "@/infrastructure/supabase/server";
import type { TransactionRow } from "@/modules/transactions/types";

type TxTypeFilter = "all" | "income" | "expense";
type MonthFilter = "this-month" | "last-month" | string; // "YYYY-MM"

export type GetTransactionsInput = {
  q?: string;
  month?: MonthFilter;
  type?: TxTypeFilter;
  page?: number;
  pageSize?: number;
};

export type GetTransactionsOk = {
  ok: true;
  rangeLabel: string;
  result: {
    rows: TransactionRow[];
    total: number;
    totalPages: number;
  };
};

export type GetTransactionsErr = {
  ok: false;
  message: string;
};

export type GetTransactionsResponse = GetTransactionsOk | GetTransactionsErr;

type TransactionJoinRow = {
  id: string;
  title: string;
  type: "income" | "expense";
  occurred_at: string;
  amount_cents: number | string;
  account: { name: string } | null;
  category: { name: string } | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getUtcMonthRangeFromYYYYMM(yyyymm: string) {
  const [y, m] = yyyymm.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function getThisMonthUtcRange() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function getLastMonthUtcRange() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function formatRangeLabel(month: MonthFilter | undefined) {
  if (!month || month === "this-month") return "Este mês";
  if (month === "last-month") return "Último mês";
  return month;
}

function mapRowToTransaction(r: TransactionJoinRow): TransactionRow {
  if (!r.id) {
    throw new Error("getTransactions: row sem id (verifique select/joins).");
  }

  return {
    id: r.id,
    title: r.title,
    type: r.type,
    occurredAt: r.occurred_at,
    amountCents: Number(r.amount_cents),
    categoryName: r.category?.name ?? "-",
    accountName: r.account?.name ?? "-",
  };
}

export async function getTransactions(
  input: GetTransactionsInput,
): Promise<GetTransactionsResponse> {
  const supabase = await supabaseServer();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    return { ok: false, message: "Sessão inválida. Faça login novamente." };
  }

  const q = (input.q ?? "").trim();
  const type = input.type ?? "all";
  const month = input.month ?? "this-month";

  const pageSize = clamp(input.pageSize ?? 10, 5, 50);
  const page = clamp(input.page ?? 1, 1, 999);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const range =
    month === "this-month"
      ? getThisMonthUtcRange()
      : month === "last-month"
        ? getLastMonthUtcRange()
        : getUtcMonthRangeFromYYYYMM(month);

  let query = supabase
    .from("transactions")
    .select(
      `
        id,
        title,
        type,
        occurred_at,
        amount_cents,
        account:accounts ( name ),
        category:categories ( name )
      `,
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .gte("occurred_at", range.startISO)
    .lt("occurred_at", range.endISO);

  if (type !== "all") query = query.eq("type", type);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error, count } = await query
    .order("occurred_at", { ascending: false })
    .range(from, to);

  if (error) return { ok: false, message: error.message };

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const typed = (data ?? []) as TransactionJoinRow[];
  const rows: TransactionRow[] = typed.map(mapRowToTransaction);

  return {
    ok: true,
    rangeLabel: formatRangeLabel(month),
    result: { rows, total, totalPages },
  };
}
