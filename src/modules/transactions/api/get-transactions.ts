import { supabaseServer } from "@/infrastructure/supabase/server";
import type {
  MonthFilter,
  TransactionRow,
  TransactionStatus,
  TxStatusFilter,
  TxTypeFilter,
} from "@/modules/transactions/types";

export type GetTransactionsInput = {
  q?: string;
  month?: MonthFilter;
  type?: TxTypeFilter;
  status?: TxStatusFilter;
  page?: number;
  pageSize?: number;
};

export type GetTransactionsResponse =
  | {
      ok: true;
      rangeLabel: string;
      result: { rows: TransactionRow[]; total: number; totalPages: number };
    }
  | { ok: false; message: string };

type DbTransactionRow = {
  id: string;
  title: string;
  type: "income" | "expense";
  status: TransactionStatus;
  occurred_at: string;
  amount_cents: number | string;
  category_id: string | null;
  account: { name: string } | null;
  category: { name: string } | null;
};

const SELECT_TRANSACTIONS = `
  id,
  title,
  type,
  status,
  occurred_at,
  amount_cents,
  category_id,
  account:accounts!transactions_account_id_user_id_fkey ( name ),
  category:categories!transactions_category_id_user_id_fkey ( name )
`;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toInt(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
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
  return {
    startISO: new Date(Date.UTC(y, m, 1, 0, 0, 0)).toISOString(),
    endISO: new Date(Date.UTC(y, m + 1, 1, 0, 0, 0)).toISOString(),
  };
}

function getLastMonthUtcRange() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return {
    startISO: new Date(Date.UTC(y, m - 1, 1, 0, 0, 0)).toISOString(),
    endISO: new Date(Date.UTC(y, m, 1, 0, 0, 0)).toISOString(),
  };
}

function getNextMonthUtcRange() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return {
    startISO: new Date(Date.UTC(y, m + 1, 1, 0, 0, 0)).toISOString(),
    endISO: new Date(Date.UTC(y, m + 2, 1, 0, 0, 0)).toISOString(),
  };
}

function formatRangeLabel(month: MonthFilter | undefined) {
  if (!month || month === "this-month") return "Este mês";
  if (month === "last-month") return "Último mês";
  if (month === "next-month") return "Próximo mês";
  return month;
}

function resolveRange(month: MonthFilter) {
  if (month === "this-month") return getThisMonthUtcRange();
  if (month === "last-month") return getLastMonthUtcRange();
  if (month === "next-month") return getNextMonthUtcRange();
  return getUtcMonthRangeFromYYYYMM(month);
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
  const status = input.status ?? "all";
  const month = (input.month ?? "this-month") as MonthFilter;

  const pageSize = clamp(input.pageSize ?? 10, 5, 50);
  const page = clamp(input.page ?? 1, 1, 999);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const range = resolveRange(month);

  let query = supabase
    .from("transactions")
    .select(SELECT_TRANSACTIONS, { count: "exact" })
    .eq("user_id", user.id)
    .gte("occurred_at", range.startISO)
    .lt("occurred_at", range.endISO);

  if (status !== "all") query = query.eq("status", status);
  if (type !== "all") query = query.eq("type", type);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error, count } = await query
    .order("occurred_at", { ascending: false })
    .range(from, to)
    .returns<DbTransactionRow[]>();

  if (error) return { ok: false, message: error.message };

  const rows: TransactionRow[] = (data ?? []).map((r) => {
    const categoryId = r.category_id ?? null;

    return {
      id: r.id,
      title: r.title,
      type: r.type,
      status: r.status,
      occurredAt: r.occurred_at,
      amountCents: toInt(r.amount_cents),
      accountName: r.account?.name ?? "—",
      categoryName: categoryId ? (r.category?.name ?? "—") : "Inbox",
    };
  });

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    ok: true,
    rangeLabel: formatRangeLabel(month),
    result: { rows, total, totalPages },
  };
}
