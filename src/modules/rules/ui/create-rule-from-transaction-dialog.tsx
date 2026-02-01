"use client";

import { Wand2 } from "lucide-react";
import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createRuleFromTransactionAction } from "@/modules/rules/actions/create-rule-from-transaction";
import type {
  AccountOption,
  CategoryOption,
} from "@/modules/transactions/api/get-form-options";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="min-w-36">
      {pending ? "Criando..." : "Criar regra"}
    </Button>
  );
}

function normalizePatternFromTitle(title: string) {
  const t = title.trim();
  if (!t) return "";
  if (t.length <= 32) return t;
  return t.slice(0, 32);
}

export function CreateRuleFromTransactionDialog({
  transactionTitle,
  transactionType,
  accounts,
  categories,
  defaultAccountId,
  defaultCategoryId,
}: {
  transactionTitle: string;
  transactionType: "income" | "expense";
  accounts: AccountOption[];
  categories: CategoryOption[];
  defaultAccountId: string | null;
  defaultCategoryId: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  const [applyType, setApplyType] = React.useState<"all" | "income" | "expense">("all");
  const [accountId, setAccountId] = React.useState<string>(defaultAccountId ?? "none");
  const [categoryId, setCategoryId] = React.useState<string>(defaultCategoryId ?? "none");

  const [pattern, setPattern] = React.useState(() =>
    normalizePatternFromTitle(transactionTitle),
  );
  const [priority, setPriority] = React.useState("100");

  const filteredCategories = React.useMemo(() => {
    if (applyType === "all") return categories;
    return categories.filter((c) => c.kind === applyType);
  }, [categories, applyType]);

  React.useEffect(() => {
    if (open) {
      setApplyType(transactionType);
      setAccountId(defaultAccountId ?? "none");
      setCategoryId(defaultCategoryId ?? "none");
      setPattern(normalizePatternFromTitle(transactionTitle));
      setPriority("100");
    }
  }, [open, transactionTitle, transactionType, defaultAccountId, defaultCategoryId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Criar regra
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Criar regra automática</DialogTitle>
          <DialogDescription>
            A Valette vai aplicar essa regra em transações futuras que combinarem com o
            padrão.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <form action={createRuleFromTransactionAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pattern">Padrão</Label>
            <Input
              id="pattern"
              name="pattern"
              placeholder='Ex: "uber", "ifood", "salário"...'
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Match: <span className="font-medium text-foreground">contains</span>{" "}
              (case-insensitive).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Aplicar em</Label>
              <Select
                name="applyType"
                value={applyType}
                onValueChange={(v) => {
                  const next = v as "all" | "income" | "expense";
                  setApplyType(next);

                  if (next !== "all") {
                    const ok = filteredCategories.some((c) => c.id === categoryId);
                    if (!ok) setCategoryId("none");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tudo</SelectItem>
                  <SelectItem value="income">Entradas</SelectItem>
                  <SelectItem value="expense">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Conta</Label>
              <Select name="accountId" value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todas as contas</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select name="categoryId" value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Não definir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não definir (Inbox)</SelectItem>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                name="priority"
                inputMode="numeric"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">Menor = aplica primeiro.</p>
            </div>

            <div className="sm:col-span-2 flex items-end justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
