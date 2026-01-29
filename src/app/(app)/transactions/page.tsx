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
import { Skeleton } from "@/shared/ui/skeleton/page";

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    month?: string;
    type?: "all" | "income" | "expense";
    page?: string;
  };
}) {
  const q = (searchParams?.q ?? "").trim();
  const month = searchParams?.month ?? "this-month";
  const type = searchParams?.type ?? "all";
  const page = clampInt(searchParams?.page, 1, 1, 999);

  const result = await getTransactions({
    q,
    month,
    type,
    page,
    pageSize: 10,
  });

  if (!result.ok) {
    // Quando sessão inválida, o middleware deve redirecionar. Aqui é fallback.
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
          actions={<TransactionsActions />}
        />

        <EmptyState
          icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
          title={isSessionError ? "Sessão inválida" : "Não foi possível carregar"}
          description={result.message}
          actions={<TransactionsActions />}
        />
      </div>
    );
  }

  const { rows, total, totalPages } = result.result;
  const periodLabel = result.rangeLabel;

  const hasRows = rows.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description={`Período: ${periodLabel}`}
        actions={<TransactionsActions />}
      />

      <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <TransactionsFilters initialQuery={q} initialMonth={month} initialType={type} />

          <Separator />

          {/* SSR não precisa de loading normalmente; fica aqui pra quando você usar streaming/suspense */}
          {false ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : hasRows ? (
            <>
              <TransactionsTable rows={rows} />
              <TransactionsPagination page={page} totalPages={totalPages} total={total} />
            </>
          ) : (
            <EmptyState
              icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
              title="Nenhuma transação encontrada"
              description="Ajuste os filtros ou crie sua primeira transação."
              actions={<TransactionsActions />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
