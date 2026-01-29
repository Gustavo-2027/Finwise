import type { TransactionRow } from "@/modules/transactions/types";

function formatMoney(amount: number, type: TransactionRow["type"]) {
  const formatted = amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return type === "expense" ? `- ${formatted}` : formatted;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function TypePill({ type }: { type: TransactionRow["type"] }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground">
      {type === "income" ? "Entrada" : "Saída"}
    </span>
  );
}

export function TransactionsTable({ rows }: { rows: TransactionRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-12 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <div className="col-span-4">Descrição</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Conta</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-2 text-right">Valor</div>
          </div>

          <div className="divide-y">
            {rows.map((t) => (
              <div key={t.id} className="grid grid-cols-12 px-4 py-3 text-sm">
                <div className="col-span-4">
                  <div className="font-medium leading-none">{t.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(t.date)}
                  </div>
                </div>

                <div className="col-span-2 text-muted-foreground">{t.category}</div>
                <div className="col-span-2 text-muted-foreground">{t.account}</div>

                <div className="col-span-2">
                  <TypePill type={t.type} />
                </div>

                <div className="col-span-2 text-right font-medium">
                  {formatMoney(t.amount, t.type)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="grid gap-2 md:hidden">
        {rows.map((t) => (
          <div key={t.id} className="rounded-xl border bg-background/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{t.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(t.date)}</span>
                  <span>•</span>
                  <span>{t.category}</span>
                  <span>•</span>
                  <span>{t.account}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold">
                  {formatMoney(t.amount, t.type)}
                </div>
                <div className="mt-1 flex justify-end">
                  <TypePill type={t.type} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
