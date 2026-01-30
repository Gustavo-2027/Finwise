import { Receipt } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTransactions } from "@/modules/transactions/api/get-transactions";
import { getTransactionsSummary } from "@/modules/transactions/api/get-transactions-summary";
import { TransactionsActions } from "@/modules/transactions/ui/actions";
import { TransactionsFilters } from "@/modules/transactions/ui/filters";
import { TransactionsPagination } from "@/modules/transactions/ui/pagination";
import { TransactionsSummaryCards } from "@/modules/transactions/ui/summary-cards";
import { TransactionsTable } from "@/modules/transactions/ui/table";
import { EmptyState } from "@/shared/ui/empty-state/page";
import { PageHeader } from "@/shared/ui/page-header/page";

const PAGE_SIZE = 10;

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function hasAnyInPeriodFromSummary(summary: {
  incomeCents: number;
  expenseCents: number;
}) {
  return summary.incomeCents > 0 || summary.expenseCents > 0;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    month?: string;
    type?: "all" | "income" | "expense";
    page?: string;
  }>;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const month = sp.month ?? "this-month";
  const type = sp.type ?? "all";
  const page = clampInt(sp.page, 1, 1, 999);

  const actions = <TransactionsActions />;

  const [listResult, summaryResult] = await Promise.all([
    getTransactions({ q, month, type, page, pageSize: PAGE_SIZE }),
    getTransactionsSummary({ month, type, q }),
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

  const hasAnyInPeriod =
    summaryResult.ok && hasAnyInPeriodFromSummary(summaryResult.summary);

  const isFiltered =
    q.length > 0 || month !== "this-month" || type !== "all" || page !== 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description={`Período: ${periodLabel}`}
        actions={actions}
      />

      {summaryResult.ok ? (
        <TransactionsSummaryCards
          rangeLabel={summaryResult.rangeLabel}
          incomeCents={summaryResult.summary.incomeCents}
          expenseCents={summaryResult.summary.expenseCents}
          netCents={summaryResult.summary.netCents}
          current={{ q, month, type }}
        />
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
                  Busque por título e refine por mês e tipo.
                </div>
              </div>

              {isFiltered ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/transactions">Limpar filtros</Link>
                </Button>
              ) : null}
            </div>

            <TransactionsFilters
              key={`${q}|${month}|${type}`}
              initialQuery={q}
              initialMonth={month}
              initialType={type}
            />
          </div>

          <Separator />

          <div className="px-4 pb-5 sm:px-6">
            {hasRows ? (
              <div className="space-y-4">
                <TransactionsTable rows={rows} />

                <Separator />

                <TransactionsPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                />
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/20 p-4">
                <EmptyState
                  icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
                  title={
                    hasAnyInPeriod
                      ? "Nenhum resultado para estes filtros"
                      : "Você ainda não tem transações neste período"
                  }
                  description={
                    hasAnyInPeriod
                      ? "Tente ajustar a busca, o mês ou o tipo — ou limpe os filtros."
                      : "Crie sua primeira transação para começar a acompanhar seu saldo."
                  }
                  actions={
                    hasAnyInPeriod ? (
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href="/transactions">Limpar filtros</Link>
                        </Button>
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
