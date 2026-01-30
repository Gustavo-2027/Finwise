import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTransactions } from "@/modules/transactions/api/get-transactions";
import { TransactionsActions } from "@/modules/transactions/ui/actions";
import { TransactionsFilters } from "@/modules/transactions/ui/filters";
import { TransactionsPagination } from "@/modules/transactions/ui/pagination";
import { TransactionsTable } from "@/modules/transactions/ui/table";
import { EmptyState } from "@/shared/ui/empty-state/page";
import { PageHeader } from "@/shared/ui/page-header/page";

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
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

  const result = await getTransactions({
    q,
    month,
    type,
    page,
    pageSize: 10,
  });

  if (!result.ok) {
    const isSessionError = result.message.toLowerCase().includes("sessão");

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
          description={result.message}
          actions={actions}
        />
      </div>
    );
  }

  const { rows, total, totalPages } = result.result;
  const periodLabel = result.rangeLabel;
  const hasRows = rows.length > 0;

  const pageSize = 10;
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description={`Período: ${periodLabel}`}
        actions={actions}
      />

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
            <div>
              <div className="text-sm font-medium">Filtros</div>
              <div className="text-xs text-muted-foreground">
                Busque por título e refine por mês e tipo.
              </div>
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
                  title="Nenhuma transação encontrada"
                  description="Ajuste os filtros ou crie sua primeira transação."
                  actions={actions}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
