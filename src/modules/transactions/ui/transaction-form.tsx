"use client";

import { Calendar, CreditCard, Layers, Tag, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type {
  AccountOption,
  CategoryOption,
} from "@/modules/transactions/queries/get-form-options";

type Mode = "create" | "edit";

export type TransactionFormInitialValues = {
  id: string;
  title: string;
  amountCents: number;
  type: "income" | "expense";
  accountId: string;
  categoryId: string;
  occurredAt: string; // ISO
  note: string | null;
};

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toBRLInputFromCents(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function toYYYYMMDD(iso: string) {
  return iso.slice(0, 10);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="min-w-40">
      {pending ? "Salvando..." : label}
    </Button>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg border bg-muted/30 p-2">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {description ? (
          <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Form unificado (create + edit) com UI premium.
 * - Sem sync de props via useEffect
 * - Edit: injeta hidden input "id"
 * - Create/Edit: usa defaultValue (SSR-friendly)
 */
export function TransactionForm({
  mode,
  action,
  submitLabel,
  cancelHref = "/transactions",
  accounts,
  categories,
  initialValues,
}: {
  mode: Mode;
  action: (formData: FormData) => void;
  submitLabel: string;
  cancelHref?: string;
  accounts: AccountOption[];
  categories: CategoryOption[];
  initialValues?: TransactionFormInitialValues;
}) {
  const initialType = initialValues?.type ?? "expense";
  const [type, setType] = useState<"income" | "expense">(initialType);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.kind === type),
    [categories, type],
  );

  const defaultAccountId = initialValues?.accountId ?? accounts[0]?.id ?? "";
  const defaultCategoryId = initialValues?.categoryId ?? filteredCategories[0]?.id ?? "";

  const typeLabel = type === "income" ? "Entrada" : "Saída";

  const defaultTitle = initialValues?.title ?? "";
  const defaultAmount = initialValues
    ? toBRLInputFromCents(initialValues.amountCents)
    : "";
  const defaultDate = initialValues
    ? toYYYYMMDD(initialValues.occurredAt)
    : todayYYYYMMDD();
  const defaultNote = initialValues?.note ?? "";

  return (
    <form action={action} className="space-y-6">
      {mode === "edit" ? (
        <input type="hidden" name="id" value={initialValues?.id ?? ""} />
      ) : null}

      {/* Detalhes */}
      <div className="space-y-4">
        <SectionTitle
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
          title="Detalhes"
          description="Informações básicas para identificar a transação."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Descrição</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Mercado, Salário, Uber..."
              autoComplete="off"
              defaultValue={defaultTitle}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Dica: prefira nomes curtos para facilitar a busca.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="120,50"
                className="pl-10"
                defaultValue={defaultAmount}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Aceita vírgula e milhar (ex: 1.234,56).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              name="type"
              value={type}
              onValueChange={(v) => setType(v as "income" | "expense")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Saída</SelectItem>
                <SelectItem value="income">Entrada</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Categorias serão filtradas para {typeLabel.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Classificação */}
      <div className="space-y-4">
        <SectionTitle
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
          title="Classificação"
          description="Escolha onde a transação entra e como será categorizada."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Conta
            </Label>

            <Select
              name="accountId"
              defaultValue={defaultAccountId}
              disabled={!defaultAccountId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={defaultAccountId ? "Selecione" : "Sem contas"}
                />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Categoria
            </Label>

            <Select
              name="categoryId"
              defaultValue={defaultCategoryId}
              disabled={filteredCategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    filteredCategories.length === 0
                      ? `Sem categorias de ${typeLabel.toLowerCase()}`
                      : "Selecione"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filteredCategories.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Crie uma categoria de {typeLabel.toLowerCase()} para continuar.
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:max-w-xs">
            <Label className="inline-flex items-center gap-2" htmlFor="date">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data
            </Label>
            <Input id="date" name="date" type="date" defaultValue={defaultDate} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Extras */}
      <div className="space-y-4">
        <SectionTitle
          icon={<Tag className="h-4 w-4 text-muted-foreground" />}
          title="Extras"
          description="Informações opcionais que ajudam no contexto."
        />

        <div className="space-y-2">
          <Label htmlFor="note">Observação (opcional)</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="Ex: compra parcelada, reembolso..."
            defaultValue={defaultNote}
          />
          <p className="text-xs text-muted-foreground">
            A observação não entra nos gráficos, mas ajuda a lembrar do contexto.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 rounded-xl border bg-muted/20 p-3">
        <Button asChild type="button" variant="outline">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>

        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
