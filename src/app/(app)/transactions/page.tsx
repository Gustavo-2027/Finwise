import { Receipt } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTransactionFormOptions } from "@/modules/transactions/api/get-form-options";
import { getTransactions } from "@/modules/transactions/api/get-transactions";
import { getTransactionsSummary } from "@/modules/transactions/api/get-transactions-summary";
import type {
  MonthFilter,
  TxStatusFilter,
  TxTypeFilter,
} from "@/modules/transactions/types";
import { TransactionsActions } from "@/modules/transactions/ui/actions";
import { TransactionsFilters } from "@/modules/transactions/ui/filters";
import { TransactionsPagination } from "@/modules/transactions/ui/pagination";
import { TransactionsSummaryCards } from "@/modules/transactions/ui/summary-cards";
import { TransactionsSummaryToggle } from "@/modules/transactions/ui/summary-toggle";
import { TransactionsTable } from "@/modules/transactions/ui/table";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

const PAGE_SIZE = 10;

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeStatus(v: unknown): TxStatusFilter {
  const s = String(v ?? "").trim();
  if (s === "all" || s === "posted" || s === "scheduled") return s;
  return "all";
}

function normalizeType(v: unknown): TxTypeFilter {
  const s = String(v ?? "").trim();
  if (s === "all" || s === "income" || s === "expense") return s;
  return "all";
}

function normalizeMonth(v: unknown): MonthFilter {
  const s = String(v ?? "").trim();
  if (!s) return "this-month";
  if (s === "this-month" || s === "last-month" || s === "next-month") return s;
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  return "this-month";
}

/**
 * Toggle de resumo:
 * - default = true (URL limpa)
 * - showScheduled=0 => false
 */
function normalizeShowScheduled(v: unknown) {
  const s = String(v ?? "").trim();
  if (s === "0" || s === "false") return false;
  return true;
}

function hasAnyPosted(summary: { incomeCents: number; expenseCents: number }) {
  return summary.incomeCents > 0 || summary.expenseCents > 0;
}

function hasAnyScheduled(summary: {
  scheduledIncomeCents: number;
  scheduledExpenseCents: number;
}) {
  return summary.scheduledIncomeCents > 0 || summary.scheduledExpenseCents > 0;
}

function ClearFiltersButton() {
  return (
    <Button asChild size="sm" variant="outline" className="shrink-0">
      <Link href="/transactions">Limpar filtros</Link>
    </Button>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    month?: string;
    type?: string;
    status?: string;
    showScheduled?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;

  // Normalização no server evita edge-cases e mantém os tipos estáveis.
  const q = (sp.q ?? "").trim();
  const month = normalizeMonth(sp.month);
  const type = normalizeType(sp.type);
  const status = normalizeStatus(sp.status);
  const showScheduled = normalizeShowScheduled(sp.showScheduled);
  const page = clampInt(sp.page, 1, 1, 999);

  const actions = <TransactionsActions />;

  /**
   * Regras do produto:
   * - A lista respeita status (posted/scheduled/all)
   * - O summary retorna posted + scheduled separados, independente do filtro de status da lista
   */
  const [listResult, summaryResult, options] = await Promise.all([
    getTransactions({ q, month, type, status, page, pageSize: PAGE_SIZE }),
    getTransactionsSummary({ month, type, q }),
    getTransactionFormOptions(),
  ]);

  if (!listResult.ok) {
    const isSessionError = listResult.message.toLowerCase().includes("sessão");

    return (
      <div className="space-y-6">
        <PageHeader
          title="Transações"
          description={
            isSessionError
              ? "Faça login para continuar."
              : "Ocorreu um erro ao carregar suas transações."
          }
          actions={actions}
        />

        <EmptyState
          icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
          title={isSessionError ? "Sessão inválida" : "Não foi possível carregar"}
          description={listResult.message}
          actions={actions}
        />
      </div>
    );
  }

  const { rows, total, totalPages } = listResult.result;
  const periodLabel = listResult.rangeLabel;

  const hasRows = rows.length > 0;
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  const isFiltered =
    q.length > 0 ||
    month !== "this-month" ||
    type !== "all" ||
    status !== "all" ||
    page !== 1;

  // O EmptyState precisa olhar o "mundo real" do período, não só a lista filtrada.
  const postedInPeriod = summaryResult.ok ? hasAnyPosted(summaryResult.summary) : false;
  const scheduledInPeriod = summaryResult.ok
    ? hasAnyScheduled(summaryResult.summary)
    : false;

  const emptyTitle = (() => {
    if (isFiltered) return "Nenhum resultado para estes filtros";

    if (status === "posted" && !postedInPeriod && scheduledInPeriod) {
      return "Você só tem transações agendadas neste período";
    }

    if (status === "scheduled" && !scheduledInPeriod && postedInPeriod) {
      return "Você só tem transações efetivadas neste período";
    }

    if (postedInPeriod || scheduledInPeriod) return "Nenhuma transação encontrada";
    return "Você ainda não tem transações neste período";
  })();

  const emptyDescription = (() => {
    if (isFiltered) {
      return "Tente ajustar a busca, o mês, o tipo ou o status — ou limpe os filtros.";
    }

    if (status === "posted" && !postedInPeriod && scheduledInPeriod) {
      return "Troque o status para “Agendadas” ou “Todos” para visualizá-las.";
    }

    if (status === "scheduled" && !scheduledInPeriod && postedInPeriod) {
      return "Troque o status para “Efetivadas” ou “Todos” para visualizá-las.";
    }

    if (postedInPeriod || scheduledInPeriod) {
      return "Ajuste os filtros ou crie uma nova transação.";
    }

    return "Crie sua primeira transação para começar a acompanhar seu saldo.";
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description={`Período: ${periodLabel}`}
        actions={actions}
      />

      {summaryResult.ok ? (
        <div className="space-y-3">
          {/* Toggle controla apenas a UI do resumo (não altera os dados retornados do backend). */}
          <TransactionsSummaryToggle />

          <TransactionsSummaryCards
            rangeLabel={summaryResult.rangeLabel}
            display={summaryResult.display}
            summary={summaryResult.summary}
            current={{ q, month, type, status, showScheduled }}
          />
        </div>
      ) : null}

      <Card className="overflow-hidden bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Transações</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualize, filtre e edite suas movimentações.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border bg-background/50 px-2 py-1 text-muted-foreground">
                Total <span className="font-medium text-foreground">{total}</span>
              </span>

              <span className="rounded-full border bg-background/50 px-2 py-1 text-muted-foreground">
                Página <span className="font-medium text-foreground">{page}</span>/
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>

              <span className="rounded-full border bg-background/50 px-2 py-1 text-muted-foreground">
                Exibindo{" "}
                <span className="font-medium text-foreground">{showingFrom}</span>–
                <span className="font-medium text-foreground">{showingTo}</span>
              </span>

              {isFiltered ? (
                <span className="rounded-full border bg-background/50 px-2 py-1 text-muted-foreground">
                  Filtros <span className="font-medium text-foreground">ativos</span>
                </span>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-5 p-0">
          <div className="space-y-4 px-4 pt-5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Filtros</div>
                <div className="text-xs text-muted-foreground">
                  Busque por título e refine por mês, tipo e status.
                </div>
              </div>

              {isFiltered ? <ClearFiltersButton /> : null}
            </div>

            <TransactionsFilters
              key={`${q}|${month}|${type}|${status}`}
              initialQuery={q}
              initialMonth={month}
              initialType={type}
              initialStatus={status}
            />
          </div>

          <Separator />

          <div className="px-4 pb-5 sm:px-6">
            {hasRows ? (
              <div className="space-y-4">
                <TransactionsTable
                  rows={rows}
                  categories={options.categories}
                  accounts={options.accounts}
                />

                <Separator />

                <div className="space-y-3">
                  <TransactionsPagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                  />

                  {isFiltered ? (
                    <div className="flex justify-end">
                      <ClearFiltersButton />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/20 p-4">
                <EmptyState
                  icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
                  title={emptyTitle}
                  description={emptyDescription}
                  actions={
                    isFiltered ? (
                      <div className="flex flex-wrap gap-2">
                        <ClearFiltersButton />
                        {actions}
                      </div>
                    ) : (
                      actions
                    )
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
