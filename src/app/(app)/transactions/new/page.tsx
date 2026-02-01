import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createTransactionAction } from "@/modules/transactions/actions/create-transaction";
import { getTransactionFormOptions } from "@/modules/transactions/api/get-form-options";
import { TransactionForm } from "@/modules/transactions/ui/transaction-form";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

export default async function NewTransactionPage() {
  const { accounts, categories } = await getTransactionFormOptions();

  const missingAccounts = accounts.length === 0;
  const missingCategories = categories.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova transação"
        description="Registre uma entrada ou saída para atualizar seu dashboard."
        actions={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </Button>
        }
      />

      {missingAccounts ? (
        <EmptyState
          title="Crie sua primeira conta"
          description="Contas representam onde o dinheiro entra e sai (ex: Nubank, Carteira, Banco)."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-2">
                <Link href="/accounts/new">Criar conta</Link>
              </Button>

              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/accounts">Ver contas</Link>
              </Button>
            </div>
          }
        />
      ) : missingCategories ? (
        <EmptyState
          title="Crie suas categorias"
          description="Categorias deixam seus relatórios e gráficos muito mais úteis."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-2">
                <Link href="/categories/new">Criar categoria</Link>
              </Button>

              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/categories">Ver categorias</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden bg-muted/20 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border bg-background/50 p-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">Dica rápida</div>
                  <p className="text-sm text-muted-foreground">
                    Categorias e contas bem definidas deixam o dashboard mais preciso e os
                    gráficos mais úteis.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link href="/categories">Gerenciar categorias</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link href="/accounts">Gerenciar contas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <TransactionForm
                mode="create"
                action={createTransactionAction}
                submitLabel="Salvar transação"
                cancelHref="/transactions"
                accounts={accounts}
                categories={categories}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
