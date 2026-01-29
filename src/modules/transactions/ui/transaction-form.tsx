"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTransactionAction } from "@/modules/transactions/actions/create-transaction";
import type { TransactionType } from "@/modules/transactions/types";

function todayISO() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function TransactionForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("Geral");
  const [account, setAccount] = useState("Principal");
  const [note, setNote] = useState("");

  const [isPending, setIsPending] = useState(false);

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Informe uma descrição.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    setIsPending(true);

    try {
      const result = await createTransactionAction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        account,
        date: todayISO(),
      });

      if (!result.ok) {
        toast.error(result.message || "Não foi possível salvar.");
        return;
      }

      toast.success("Transação criada!");
      router.push("/transactions");
      router.refresh();
    } catch {
      toast.error("Erro inesperado ao salvar.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Descrição</Label>
          <Input
            id="title"
            placeholder="Ex: Mercado, Salário, Uber..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="Ex: 120,50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Saída</SelectItem>
              <SelectItem value="income">Entrada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Conta</Label>
          <Input
            id="account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="note">Observação (opcional)</Label>
          <Textarea
            id="note"
            placeholder="Ex: compra parcelada, reembolso..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/transactions")}
          disabled={isPending}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar transação"}
        </Button>
      </div>
    </form>
  );
}
