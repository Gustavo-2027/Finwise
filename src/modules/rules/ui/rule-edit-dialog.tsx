"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import type { Rule } from "@/modules/rules/domain/rule.types";

type Option = { id: string; name: string };

export function RuleEditDialog(props: {
  rule: Rule;
  accounts: Option[];
  categories: Option[];
  updateAction: (formData: FormData) => void;
}) {
  const { rule, accounts, categories, updateAction } = props;

  const [open, setOpen] = useState(false);

  // Sentinel values (Radix/shadcn não permite value vazio)
  const defaultAccount = useMemo(() => rule.accountId ?? "__all__", [rule.accountId]);
  const defaultCategory = useMemo(() => rule.categoryId ?? "__none__", [rule.categoryId]);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Editar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="space-y-5">
          <DialogHeader>
            <DialogTitle>Editar regra</DialogTitle>
            <DialogDescription>
              Ajuste o padrão, escopo e categoria aplicada.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="id" value={rule.id} />
            <input type="hidden" name="isEnabled" value={String(rule.isEnabled)} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`pattern-${rule.id}`}>Padrão</Label>
                <Input
                  id={`pattern-${rule.id}`}
                  name="pattern"
                  defaultValue={rule.pattern}
                  placeholder='Ex: "UBER"'
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Para Regex, informe apenas o padrão (sem / /). Ex:{" "}
                  <span className="font-mono">^UBER</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Match</Label>
                <Select name="matchType" defaultValue={rule.matchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contém</SelectItem>
                    <SelectItem value="starts_with">Começa com</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aplicar em</Label>
                <Select name="applyType" defaultValue={rule.applyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`priority-${rule.id}`}>Prioridade</Label>
                <Input
                  id={`priority-${rule.id}`}
                  name="priority"
                  type="number"
                  min={0}
                  defaultValue={rule.priority}
                />
              </div>

              <div className="space-y-2">
                <Label>Conta (opcional)</Label>
                <Select name="accountId" defaultValue={defaultAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas as contas</SelectItem>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria (opcional)</Label>
                <Select name="categoryId" defaultValue={defaultCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem categoria (Inbox)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem categoria (Inbox)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
