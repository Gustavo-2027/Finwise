import {
  ArrowUpRight,
  CreditCard,
  FileUp,
  Plus,
  Receipt,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getTransactions } from "@/modules/transactions/api/get-transactions";
import { getTransactionsSummary } from "@/modules/transactions/api/get-transactions-summary";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

function formatBRLFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatMoneyFromCents(cents: number, type: "income" | "expense") {
  const formatted = formatBRLFromCents(Math.abs(cents));
  return type === "expense" ? `- ${formatted}` : formatted;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function TypePill({ type }: { type: "income" | "expense" }) {
  const isIncome = type === "income";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isIncome
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      {isIncome ? "Entrada" : "Saída"}
    </span>
  );
}

function StatCard({
  title,
  value,
  helper,
  loading,
  icon,
  badge,
  tone,
}: {
  title: string;
  value: string;
  helper?: string;
  loading?: boolean;
  icon: React.ReactNode;
  badge?: string;
  tone?: "neutral" | "success" | "danger";
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55",
        "transition hover:-translate-y-0.5 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>

            {badge ? (
              <div className="mt-2 inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground">
                {badge}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl border bg-background/60",
              tone === "success" && "text-emerald-600 dark:text-emerald-400",
              tone === "danger" && "text-rose-600 dark:text-rose-400",
              (!tone || tone === "neutral") && "text-muted-foreground",
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <div
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums",
              tone === "success" && "text-emerald-600 dark:text-emerald-400",
              tone === "danger" && "text-rose-600 dark:text-rose-400",
            )}
          >
            {value}
          </div>
        )}

        {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      </CardContent>

      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-border/50" />
    </Card>
  );
}

function QuickAction({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "h-auto w-full justify-between rounded-2xl border bg-background/40 px-3 py-3 text-left",
        "transition hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <Link href={href} className="group flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-background/60 text-muted-foreground">
            {icon}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-medium leading-none">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{description}</div>
          </div>
        </div>

        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}

export default async function DashboardPage() {
  const [summaryThisMonth, latest] = await Promise.all([
    getTransactionsSummary({ month: "this-month" }),
    getTransactions({ month: "this-month", type: "all", page: 1, pageSize: 5 }),
  ]);

  const isLoading = false;

  const incomeCents = summaryThisMonth.ok ? summaryThisMonth.summary.incomeCents : 0;
  const expenseCents = summaryThisMonth.ok ? summaryThisMonth.summary.expenseCents : 0;
  const netCents = summaryThisMonth.ok ? summaryThisMonth.summary.netCents : 0;

  const hasTransactions = latest.ok ? latest.result.total > 0 : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do mês atual."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/transactions">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Ver transações</span>
              </Link>
            </Button>

            <Button asChild size="sm" className="gap-2">
              <Link href="/transactions/new">
                <Plus className="h-4 w-4" />
                Nova transação
              </Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Saldo do mês"
          value={formatBRLFromCents(netCents)}
          helper="Entradas − Saídas (efetivadas)"
          badge="Este mês"
          loading={isLoading}
          tone={netCents > 0 ? "success" : netCents < 0 ? "danger" : "neutral"}
          icon={<Wand2 className="h-4 w-4" />}
        />

        <StatCard
          title="Entradas"
          value={formatBRLFromCents(incomeCents)}
          helper="Receitas efetivadas no período"
          badge="Este mês"
          loading={isLoading}
          tone="success"
          icon={<Plus className="h-4 w-4" />}
        />

        <StatCard
          title="Saídas"
          value={formatBRLFromCents(expenseCents)}
          helper="Despesas efetivadas no período"
          badge="Este mês"
          loading={isLoading}
          tone="danger"
          icon={<Receipt className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">Últimas transações</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Um recorte rápido do que aconteceu este mês
                </p>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href="/transactions">Ver tudo</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : hasTransactions && latest.ok ? (
              <div className="overflow-hidden rounded-2xl border bg-background/40">
                <div className="divide-y">
                  {latest.result.rows.map((t) => (
                    <Link
                      key={t.id}
                      href={`/transactions/${t.id}/edit`}
                      className={cn(
                        "block px-4 py-3 transition-colors hover:bg-muted/20",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-medium">{t.title}</div>
                            <TypePill type={t.type} />
                          </div>

                          <div className="mt-1 text-xs text-muted-foreground">
                            <span>{formatDate(t.occurredAt)}</span>
                            <span className="mx-2 text-muted-foreground/60">•</span>
                            <span className="truncate">{t.categoryName}</span>
                            <span className="mx-2 text-muted-foreground/60">•</span>
                            <span className="truncate">{t.accountName}</span>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "shrink-0 text-sm font-semibold tabular-nums",
                            t.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground",
                          )}
                        >
                          {formatMoneyFromCents(t.amountCents, t.type)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
                title="Sem transações ainda"
                description="Crie sua primeira transação para ver o resumo do mês e insights."
                actions={
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button asChild className="gap-2">
                      <Link href="/transactions/new">
                        <Plus className="h-4 w-4" />
                        Criar transação
                      </Link>
                    </Button>

                    <Button asChild variant="outline" className="gap-2">
                      <Link href="/import">
                        <FileUp className="h-4 w-4" />
                        Importar CSV
                      </Link>
                    </Button>
                  </div>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
          <CardHeader className="pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Ações rápidas</CardTitle>
              <p className="text-xs text-muted-foreground">
                Configure o Valette em poucos cliques
              </p>
            </div>
          </CardHeader>

          <CardContent className="grid gap-2">
            <QuickAction
              title="Adicionar conta"
              description="Organize suas fontes e despesas"
              icon={<CreditCard className="h-4 w-4" />}
              href="/accounts"
            />

            <QuickAction
              title="Criar regra"
              description="Automatize categorias e descrições"
              icon={<Wand2 className="h-4 w-4" />}
              href="/rules"
            />

            <QuickAction
              title="Importar CSV"
              description="Traga dados do banco rapidamente"
              icon={<FileUp className="h-4 w-4" />}
              href="/import"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
