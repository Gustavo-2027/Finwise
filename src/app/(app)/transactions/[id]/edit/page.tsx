import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreateRuleFromTransactionDialog } from "@/modules/rules/ui/create-rule-from-transaction-dialog";
import { deleteTransactionAction } from "@/modules/transactions/actions/delete-transaction";
import { updateTransactionAction } from "@/modules/transactions/actions/update-transaction";
import { getTransactionFormOptions } from "@/modules/transactions/api/get-form-options";
import { getTransactionById } from "@/modules/transactions/api/get-transaction-by-id";
import { DeleteTransactionSection } from "@/modules/transactions/ui/delete-transaction-section";
import { TransactionForm } from "@/modules/transactions/ui/transaction-form";
import { PageHeader } from "@/shared/ui/page-header";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tx = await getTransactionById(id);

  // Sessão inválida => manda pro login (middleware normalmente pega, mas é um fallback bom)
  if (!tx.ok && tx.message.toLowerCase().includes("sessão")) {
    redirect("/login");
  }

  // Não achou => 404 real
  if (!tx.ok) notFound();

  const { accounts, categories } = await getTransactionFormOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar transação"
        description="Atualize os detalhes, crie uma regra ou exclua a transação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/transactions">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
            </Button>

            <CreateRuleFromTransactionDialog
              transactionTitle={tx.data.title}
              transactionType={tx.data.type}
              accounts={accounts}
              categories={categories}
              defaultAccountId={tx.data.accountId ?? null}
              defaultCategoryId={tx.data.categoryId ?? null}
            />
          </div>
        }
      />

      <Card className="overflow-hidden bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Detalhes</CardTitle>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Wand2 className="h-4 w-4" />
              <span>Crie regras a partir desta transação</span>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6 pt-6">
          <TransactionForm
            mode="edit"
            action={updateTransactionAction}
            submitLabel="Salvar alterações"
            cancelHref="/transactions"
            accounts={accounts}
            categories={categories}
            initialValues={{
              id: tx.data.id,
              title: tx.data.title,
              type: tx.data.type,
              accountId: tx.data.accountId,
              categoryId: tx.data.categoryId,
              occurredAt: tx.data.occurredAt,
              amountCents: tx.data.amountCents,
              note: tx.data.note,
            }}
          />

          <Separator />

          <DeleteTransactionSection
            transactionId={tx.data.id}
            action={deleteTransactionAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
