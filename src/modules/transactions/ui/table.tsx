// src/modules/transactions/ui/table.tsx
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { TransactionRow } from "@/modules/transactions/types";

function formatMoneyFromCents(cents: number, type: TransactionRow["type"]) {
  const value = cents / 100;

  const formatted = value.toLocaleString("pt-BR", {
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

export function TransactionsTable({ rows }: { rows: TransactionRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border bg-card">
          {/* header */}
          <div className="grid grid-cols-12 border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <div className="col-span-4">Descrição</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Conta</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-2 text-right">Valor</div>
          </div>

          <div className="divide-y">
            {rows.map((t) => {
              const href = `/transactions/${t.id}/edit`;
              const isIncome = t.type === "income";

              return (
                <Link
                  key={t.id}
                  href={href}
                  className={cn(
                    "block focus:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  <div className="grid grid-cols-12 px-4 py-3 text-sm transition-colors hover:bg-muted/20">
                    <div className="col-span-4 min-w-0">
                      <div className="truncate font-medium leading-none">{t.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDate(t.occurredAt)}
                      </div>
                    </div>

                    <div className="col-span-2 truncate text-muted-foreground">
                      {t.categoryName}
                    </div>
                    <div className="col-span-2 truncate text-muted-foreground">
                      {t.accountName}
                    </div>

                    <div className="col-span-2">
                      <TypePill type={t.type} />
                    </div>

                    <div
                      className={cn(
                        "col-span-2 text-right font-medium tabular-nums",
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      {formatMoneyFromCents(t.amountCents, t.type)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Dica: clique em uma transação para editar ou excluir.
        </p>
      </div>

      {/* Mobile */}
      <div className="grid gap-2 md:hidden">
        {rows.map((t) => {
          const href = `/transactions/${t.id}/edit`;
          const isIncome = t.type === "income";

          return (
            <Link
              key={t.id}
              href={href}
              className={cn(
                "block rounded-xl border bg-background/40 p-3 transition-colors",
                "hover:bg-muted/10 focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.title}</div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(t.occurredAt)}</span>
                    <span>•</span>
                    <span className="truncate">{t.categoryName}</span>
                    <span>•</span>
                    <span className="truncate">{t.accountName}</span>
                  </div>

                  <div className="mt-2">
                    <TypePill type={t.type} />
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground",
                    )}
                  >
                    {formatMoneyFromCents(t.amountCents, t.type)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
