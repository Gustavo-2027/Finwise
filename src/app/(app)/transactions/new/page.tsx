import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/modules/transactions/ui/transaction-form";
import { PageHeader } from "@/shared/ui/page-header/page";

export default function NewTransactionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova transação"
        description="Registre uma entrada ou saída para atualizar seu dashboard."
      />

      <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm />
        </CardContent>
      </Card>
    </div>
  );
}
