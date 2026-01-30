import { notFound, redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { deleteTransactionAction } from "@/modules/transactions/actions/delete-transaction";
import { updateTransactionAction } from "@/modules/transactions/actions/update-transaction";
import { getTransactionFormOptions } from "@/modules/transactions/queries/get-form-options";
import { getTransactionById } from "@/modules/transactions/queries/get-transaction-by-id";
import { DeleteTransactionSection } from "@/modules/transactions/ui/delete-transaction-section";
import { TransactionForm } from "@/modules/transactions/ui/transaction-form";
import { PageHeader } from "@/shared/ui/page-header/page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tx = await getTransactionById(id);

  // Sessão inválida => manda pro login (middleware normalmente pega, mas é um fallback bom)
  if (!tx.ok && tx.message.toLowerCase().includes("sessão")) {
    redirect("/login");
  }

  // Não achou => 404 real
  if (!tx.ok) {
    notFound();
  }

  const { accounts, categories } = await getTransactionFormOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar transação"
        description="Atualize os detalhes ou exclua a transação."
      />

      <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalhes</CardTitle>
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
