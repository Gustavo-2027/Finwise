import {
  ArrowUpRight,
  CreditCard,
  FileUp,
  Plus,
  Receipt,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { EmptyState } from "@/shared/ui/empty-state/page";
import { PageHeader } from "@/shared/ui/page-header/page";
import { Skeleton } from "@/shared/ui/skeleton/page";

function StatCard({
  title,
  value,
  helper,
  loading,
  icon,
  badge,
}: {
  title: string;
  value: string;
  helper?: string;
  loading?: boolean;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
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

          <div className="grid h-9 w-9 place-items-center rounded-xl border bg-background/60 text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        )}

        {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}

function QuickAction({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between gap-3 rounded-xl border bg-background/40 px-3 py-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border bg-background/60 text-muted-foreground">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium leading-none">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
      </div>

      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </button>
  );
}

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  const email = data.user?.email ?? "—";

  // Placeholder: aqui depois você pluga aggregates reais (saldo, entradas/saídas)
  const isLoading = false;
  const hasTransactions = false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Bem-vindo. Sessão: ${email}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Dicas
            </Button>

            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nova transação
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Saldo do mês"
          value="R$ 0,00"
          helper="Entradas - Saídas"
          badge="Últimos 30 dias"
          loading={isLoading}
          icon={<Wand2 className="h-4 w-4" />}
        />
        <StatCard
          title="Entradas"
          value="R$ 0,00"
          helper="Somatório de receitas"
          badge="Últimos 30 dias"
          loading={isLoading}
          icon={<Plus className="h-4 w-4" />}
        />
        <StatCard
          title="Saídas"
          value="R$ 0,00"
          helper="Somatório de despesas"
          badge="Últimos 30 dias"
          loading={isLoading}
          icon={<Receipt className="h-4 w-4" />}
        />
      </section>

      {/* Conteúdo principal */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Últimas transações */}
        <Card className="lg:col-span-2 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">Últimas transações</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Acompanhe suas movimentações recentes
                </p>
              </div>

              <Button variant="outline" size="sm">
                Ver tudo
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
            ) : hasTransactions ? (
              <div className="text-sm text-muted-foreground">
                Em breve: lista de transações.
              </div>
            ) : (
              <EmptyState
                icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
                title="Sem transações ainda"
                description="Crie sua primeira transação para ver o resumo do mês e insights."
                actions={
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar transação
                    </Button>
                    <Button variant="outline">
                      <FileUp className="mr-2 h-4 w-4" />
                      Importar CSV
                    </Button>
                  </div>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
          <CardHeader className="pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base">Ações rápidas</CardTitle>
              <p className="text-xs text-muted-foreground">
                Atalhos para configurar seu Finwise
              </p>
            </div>
          </CardHeader>

          <CardContent className="grid gap-2">
            <QuickAction
              title="Adicionar conta"
              description="Crie uma conta para organizar entradas e saídas"
              icon={<CreditCard className="h-4 w-4" />}
            />
            <QuickAction
              title="Criar regra"
              description="Automatize categorias e descrições"
              icon={<Wand2 className="h-4 w-4" />}
            />
            <QuickAction
              title="Importar CSV"
              description="Traga dados do banco em poucos cliques"
              icon={<FileUp className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
