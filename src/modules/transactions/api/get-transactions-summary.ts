// src/modules/transactions/api/get-transactions-summary.ts
import { supabaseServer } from "@/infrastructure/supabase/server";
import type {
  MonthFilter,
  TxStatusFilter,
  TxTypeFilter,
} from "@/modules/transactions/types";

export type GetTransactionsSummaryInput = {
  q?: string;
  month?: MonthFilter;
  type?: TxTypeFilter;
  status?: TxStatusFilter; // ✅ novo
};

export type GetTransactionsSummaryResponse =
  | {
      ok: true;
      rangeLabel: string;

      // sempre vem completo
      summary: {
        incomeCents: number;
        expenseCents: number;
        netCents: number;

        scheduledIncomeCents: number;
        scheduledExpenseCents: number;
        scheduledNetCents: number;
      };

      // ✅ o que a UI deve usar como “principal”
      display: {
        incomeCents: number;
        expenseCents: number;
        netCents: number;
        label: "Efetivadas" | "Agendadas" | "Total";
      };
    }
  | { ok: false; message: string };

type SummaryRpcArgs = {
  p_start: string;
  p_end: string;
  p_type?: string;
  p_q?: string;
};

type SummaryRow = {
  income_cents: number | null;
  expense_cents: number | null;
  scheduled_income_cents: number | null;
  scheduled_expense_cents: number | null;
};

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

function formatRangeLabel(month: MonthFilter | undefined) {
  if (!month || month === "this-month") return "Este mês";
  if (month === "last-month") return "Último mês";
  return month;
}

export async function getTransactionsSummary(
  input: GetTransactionsSummaryInput,
): Promise<GetTransactionsSummaryResponse> {
  const supabase = await supabaseServer();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    return { ok: false, message: "Sessão inválida. Faça login novamente." };
  }

  const q = (input.q ?? "").trim();
  const type = input.type ?? "all";
  const month = input.month ?? "this-month";
  const status = input.status ?? "all"; // ✅ novo

  const range =
    month === "this-month"
      ? getThisMonthUtcRange()
      : month === "last-month"
        ? getLastMonthUtcRange()
        : getUtcMonthRangeFromYYYYMM(month);

  const args: SummaryRpcArgs = { p_start: range.startISO, p_end: range.endISO };
  if (type !== "all") args.p_type = type;
  if (q) args.p_q = q;

  const { data, error } = await supabase.rpc("get_transactions_summary", args);
  if (error) return { ok: false, message: error.message };

  const row = (Array.isArray(data) ? data[0] : data) as SummaryRow | null;

  const postedIncome = toInt(row?.income_cents);
  const postedExpense = toInt(row?.expense_cents);
  const scheduledIncome = toInt(row?.scheduled_income_cents);
  const scheduledExpense = toInt(row?.scheduled_expense_cents);

  const full = {
    incomeCents: postedIncome,
    expenseCents: postedExpense,
    netCents: postedIncome - postedExpense,

    scheduledIncomeCents: scheduledIncome,
    scheduledExpenseCents: scheduledExpense,
    scheduledNetCents: scheduledIncome - scheduledExpense,
  };

  // ✅ display “principal” seguindo o filtro da lista
  const display =
    status === "posted"
      ? {
          incomeCents: full.incomeCents,
          expenseCents: full.expenseCents,
          netCents: full.netCents,
          label: "Efetivadas" as const,
        }
      : status === "scheduled"
        ? {
            incomeCents: full.scheduledIncomeCents,
            expenseCents: full.scheduledExpenseCents,
            netCents: full.scheduledNetCents,
            label: "Agendadas" as const,
          }
        : {
            incomeCents: full.incomeCents + full.scheduledIncomeCents,
            expenseCents: full.expenseCents + full.scheduledExpenseCents,
            netCents: full.netCents + full.scheduledNetCents,
            label: "Total" as const,
          };

  return {
    ok: true,
    rangeLabel: formatRangeLabel(month),
    summary: full,
    display,
  };
}
