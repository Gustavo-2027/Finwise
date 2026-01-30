import { supabaseServer } from "@/infrastructure/supabase/server";

type TxTypeFilter = "all" | "income" | "expense";
type MonthFilter = "this-month" | "last-month" | string; // "YYYY-MM"

export type GetTransactionsSummaryInput = {
  month?: MonthFilter;
  type?: TxTypeFilter;
  q?: string;
};

export type TransactionsSummary = {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

type TransactionsSummaryRow = {
  income_cents: number | null;
  expense_cents: number | null;
};

export type GetTransactionsSummaryResponse =
  | { ok: true; rangeLabel: string; summary: TransactionsSummary }
  | { ok: false; message: string };

type SummaryRpcArgs = {
  p_start: string;
  p_end: string;
  p_type?: string;
  p_q?: string;
};

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

function toInt(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
}

export async function getTransactionsSummary(
  input: GetTransactionsSummaryInput,
): Promise<GetTransactionsSummaryResponse> {
  const supabase = await supabaseServer();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return { ok: false, message: "Sessão inválida. Faça login novamente." };
  }

  const month = input.month ?? "this-month";
  const type = input.type ?? "all";
  const q = (input.q ?? "").trim();

  const range =
    month === "this-month"
      ? getThisMonthUtcRange()
      : month === "last-month"
        ? getLastMonthUtcRange()
        : getUtcMonthRangeFromYYYYMM(month);

  const args: SummaryRpcArgs = {
    p_start: range.startISO,
    p_end: range.endISO,
  };

  if (type !== "all") args.p_type = type;
  if (q) args.p_q = q;

  const { data, error } = await supabase.rpc("get_transactions_summary", args);

  if (error) return { ok: false, message: error.message };

  const row = (Array.isArray(data) ? data[0] : data) as TransactionsSummaryRow | null;

  const incomeCents = toInt(row?.income_cents);
  const expenseCents = toInt(row?.expense_cents);

  return {
    ok: true,
    rangeLabel: formatRangeLabel(month),
    summary: {
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents,
    },
  };
}
