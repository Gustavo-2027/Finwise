import { supabaseServer } from "@/infrastructure/supabase/server";
import type {
  TransactionRow,
  TransactionsFilters,
  TransactionsResult,
} from "@/modules/transactions/domain/transaction.types";
import type { Database } from "@/shared/types/database.types";

/**
 * Tipo da linha vindo do banco (somente colunas usadas na listagem).
 * Evita "cast cego" e mantém o retorno alinhado ao schema real.
 */
type TransactionRowDB = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "id" | "title" | "account" | "category" | "type" | "amount" | "date"
>;

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getMonthRange(month?: string) {
  const now = new Date();

  function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  }

  function startOfNextMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  }

  if (!month || month === "this-month") {
    const start = startOfMonth(now);
    const end = startOfNextMonth(now);
    return { start, end, label: "Este mês" };
  }

  if (month === "last-month") {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const start = startOfMonth(last);
    const end = startOfNextMonth(last);
    return { start, end, label: "Último mês" };
  }

  if (/^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(y, m, 1, 0, 0, 0, 0);
    return { start, end, label: month };
  }

  const start = startOfMonth(now);
  const end = startOfNextMonth(now);
  return { start, end, label: "Este mês" };
}

export async function getTransactions(filters: TransactionsFilters) {
  const supabase = await supabaseServer();
  const { data: authData } = await supabase.auth.getUser();

  const user = authData.user;
  if (!user) {
    return { ok: false as const, message: "Sessão inválida." };
  }

  const q = (filters.q ?? "").trim();
  const type = filters.type ?? "all";
  const month = filters.month ?? "this-month";

  const pageSize = clampInt(filters.pageSize ?? 10, 5, 50);
  const page = clampInt(filters.page ?? 1, 1, 999);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const range = getMonthRange(month);

  // Base query (SSR) com paginação
  let query = supabase
    .from("transactions")
    .select("id,title,account,category,type,amount,date", { count: "exact" })
    .eq("user_id", user.id)
    .gte("date", range.start.toISOString())
    .lt("date", range.end.toISOString())
    .order("date", { ascending: false })
    .range(from, to);

  if (type !== "all") {
    query = query.eq("type", type);
  }

  if (q) {
    // Evita quebrar o "or" se o usuário digitar vírgula
    const escaped = q.replaceAll(",", " ");
    query = query.or(
      `title.ilike.%${escaped}%,category.ilike.%${escaped}%,account.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return { ok: false as const, message: error.message };
  }

  const dbRows: TransactionRowDB[] = (data ?? []) as TransactionRowDB[];

  // Normaliza para o type do domínio (mantém o app desacoplado do DB)
  const rows: TransactionRow[] = dbRows.map((row) => ({
    id: row.id,
    title: row.title,
    account: row.account,
    category: row.category,
    type: row.type,
    amount: typeof row.amount === "string" ? Number(row.amount) : (row.amount as number),
    date: row.date,
  }));

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const result: TransactionsResult = {
    rows,
    total,
    totalPages,
    page,
    pageSize,
  };

  return { ok: true as const, result, rangeLabel: range.label };
}
