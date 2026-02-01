"use client";

import { Copy, MoreHorizontal, Pencil, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createRuleFromTransactionAction } from "@/modules/rules/actions/create-rule-from-transaction";
import type { TransactionRow } from "@/modules/transactions/types";

type AccountOption = { id: string; name: string };
type CategoryOption = { id: string; name: string; kind: "income" | "expense" };

function formatMoneyFromCents(cents: number, type: TransactionRow["type"]) {
  const value = Math.abs(cents) / 100;
  const formatted = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

function StatusPill({ status }: { status: TransactionRow["status"] }) {
  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        Agendada
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Efetivada
    </span>
  );
}

function InboxPill() {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Inbox
    </span>
  );
}

function isInbox(categoryName: string) {
  return categoryName.trim().toLowerCase() === "inbox";
}

function RuleDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  accounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: { id: string; title: string; type: "income" | "expense" };
  categories?: CategoryOption[];
  accounts?: AccountOption[];
}) {
  const [ruleName, setRuleName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("__none__");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("__all__");

  const categoriesForType = useMemo(() => {
    const list = categories ?? [];
    return list.filter((c) => c.kind === transaction.type);
  }, [categories, transaction.type]);

  const suggested = useMemo(() => {
    const base = transaction.title.trim();
    if (!base) return "Nova regra";
    return base.length > 32 ? `${base.slice(0, 32)}…` : base;
  }, [transaction.title]);

  const defaultRuleName = ruleName.trim() ? ruleName.trim() : suggested;

  const accountIdToSubmit = selectedAccountId === "__all__" ? "" : selectedAccountId;
  const categoryIdToSubmit = selectedCategoryId === "__none__" ? "" : selectedCategoryId;

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Criar regra</DialogTitle>
        </DialogHeader>

        <form
          action={async (fd) => {
            if (!fd.get("name")) fd.set("name", defaultRuleName);

            fd.set("pattern", transaction.title);
            fd.set("match_type", "contains");
            fd.set("apply_type", transaction.type);

            fd.set("category_id", categoryIdToSubmit);
            fd.set("account_id", accountIdToSubmit);

            await createRuleFromTransactionAction(fd);
            handleClose();
          }}
          className="space-y-4"
        >
          <input type="hidden" name="transactionId" value={transaction.id} />

          <div className="space-y-2">
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input
              id="name"
              name="name"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder={suggested}
            />
            <p className="text-xs text-muted-foreground">
              A regra dispara quando o título contiver:{" "}
              <span className="font-medium text-foreground">{transaction.title}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Categoria (opcional)</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Sem categoria (Inbox)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem categoria (Inbox)</SelectItem>
                {categoriesForType.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categoriesForType.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Você ainda não tem categorias de{" "}
                {transaction.type === "income" ? "entrada" : "saída"}. A regra será criada
                sem categoria.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Conta (opcional)</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Qualquer conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Qualquer conta</SelectItem>
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Criar regra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TransactionsTable({
  rows,
  categories,
  accounts,
}: {
  rows: TransactionRow[];
  categories?: CategoryOption[];
  accounts?: AccountOption[];
}) {
  const [ruleTx, setRuleTx] = useState<{
    id: string;
    title: string;
    type: "income" | "expense";
  } | null>(null);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-12 border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <div className="col-span-4">Descrição</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Conta</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-1 text-right">Valor</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          <div className="divide-y">
            {rows.map((t) => {
              const href = `/transactions/${t.id}/edit`;
              const income = t.type === "income";
              const inbox = isInbox(t.categoryName);

              return (
                <div key={t.id} className="group">
                  <div className="grid grid-cols-12 items-center px-4 py-3 text-sm transition-colors hover:bg-muted/20">
                    <Link
                      href={href}
                      aria-label={`Editar transação: ${t.title}`}
                      className={cn(
                        "col-span-11 grid grid-cols-11 items-center rounded-md",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      <div className="col-span-4 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="truncate font-medium leading-none">
                            {t.title}
                          </div>
                          <StatusPill status={t.status} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDate(t.occurredAt)}
                        </div>
                      </div>

                      <div className="col-span-2 min-w-0 pr-3">
                        {inbox ? (
                          <InboxPill />
                        ) : (
                          <div className="truncate text-muted-foreground">
                            {t.categoryName}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 min-w-0 pr-3 truncate text-muted-foreground">
                        {t.accountName}
                      </div>

                      <div className="col-span-2 pr-3">
                        <TypePill type={t.type} />
                      </div>

                      <div
                        className={cn(
                          "col-span-1 text-right font-medium tabular-nums",
                          income
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground",
                        )}
                      >
                        {formatMoneyFromCents(t.amountCents, t.type)}
                      </div>
                    </Link>

                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                              "transition-opacity",
                            )}
                            aria-label="Abrir ações"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem asChild>
                            <Link href={href} className="flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            disabled={!inbox}
                            onSelect={(e) => {
                              e.preventDefault();
                              if (!inbox) return;
                              setRuleTx({ id: t.id, title: t.title, type: t.type });
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                            Criar regra
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onSelect={(e) => {
                              e.preventDefault();
                              void navigator.clipboard?.writeText?.(t.title);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            Copiar título
                          </DropdownMenuItem>

                          <DropdownMenuItem className="flex items-center gap-2" disabled>
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Efetivada = entra no resumo. Agendada = aparece no mês da data e entra no resumo
          como agendada.
        </p>
      </div>

      {/* Mobile */}
      <div className="grid gap-2 md:hidden">
        {rows.map((t) => {
          const href = `/transactions/${t.id}/edit`;
          const income = t.type === "income";
          const inbox = isInbox(t.categoryName);

          return (
            <div key={t.id} className="space-y-2">
              <Link
                href={href}
                aria-label={`Editar transação: ${t.title}`}
                className={cn(
                  "block rounded-xl border bg-background/40 p-3 transition-colors",
                  "hover:bg-muted/10 focus:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-medium">{t.title}</div>
                      <StatusPill status={t.status} />
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(t.occurredAt)}</span>
                      <span>•</span>
                      {inbox ? (
                        <InboxPill />
                      ) : (
                        <span className="truncate">{t.categoryName}</span>
                      )}
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
                        income
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      {formatMoneyFromCents(t.amountCents, t.type)}
                    </div>
                  </div>
                </div>
              </Link>

              {inbox ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setRuleTx({ id: t.id, title: t.title, type: t.type })}
                  >
                    <Sparkles className="h-4 w-4" />
                    Criar regra
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {ruleTx ? (
        <RuleDialog
          open={!!ruleTx}
          onOpenChange={(v) => (!v ? setRuleTx(null) : null)}
          transaction={ruleTx}
          categories={categories}
          accounts={accounts}
        />
      ) : null}
    </>
  );
}
