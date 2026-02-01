"use client";

import { Calendar, CalendarClock, CreditCard, Layers, Tag, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
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
} from "@/modules/transactions/api/get-form-options";

type Mode = "create" | "edit";

export type TransactionFormInitialValues = {
  id: string;
  title: string;
  amountCents: number;
  type: "income" | "expense";
  status: "posted" | "scheduled"; // ✅ novo
  accountId: string;
  categoryId: string | null;
  occurredAt: string;
  note: string | null;
};

const INBOX_VALUE = "__inbox__";

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

function firstCategoryIdOf(list: CategoryOption[]) {
  return list[0]?.id ?? null;
}

function isValidCategoryId(id: string, list: CategoryOption[]) {
  return list.some((c) => c.id === id);
}

function parseBrlMoney(raw: string) {
  const v = String(raw ?? "").trim();
  if (!v) return NaN;
  const normalized = v.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

type FormErrors = Partial<{
  title: string;
  amount: string;
  type: string;
  status: string; // ✅ novo
  accountId: string;
  categoryId: string;
  date: string;
}>;

type Touched = Partial<Record<keyof FormErrors, boolean>>;

function validateSnapshot(snapshot: {
  title: string;
  amount: string;
  type: string;
  status: string;
  accountId: string;
  categoryId: string;
  date: string;
}): FormErrors {
  const nextErrors: FormErrors = {};

  const title = snapshot.title.trim();
  if (title.length < 2) nextErrors.title = "Informe uma descrição (mín. 2 caracteres).";

  const money = parseBrlMoney(snapshot.amount);
  if (!Number.isFinite(money) || money <= 0)
    nextErrors.amount = "Informe um valor válido.";

  if (snapshot.type !== "income" && snapshot.type !== "expense") {
    nextErrors.type = "Selecione um tipo.";
  }

  if (snapshot.status !== "posted" && snapshot.status !== "scheduled") {
    nextErrors.status = "Selecione um status válido.";
  }

  if (!snapshot.accountId || !isUUID(snapshot.accountId)) {
    nextErrors.accountId = "Selecione uma conta válida.";
  }

  if (snapshot.categoryId && !isUUID(snapshot.categoryId)) {
    nextErrors.categoryId = "Categoria inválida.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date.trim())) {
    nextErrors.date = "Informe uma data válida.";
  }

  return nextErrors;
}

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} className="min-w-40">
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

function ErrorBanner({ count }: { count: number }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
      <div className="text-sm font-medium text-rose-700 dark:text-rose-300">
        Corrija os campos abaixo
      </div>
      <div className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">
        {count === 1
          ? "Há 1 erro impedindo o envio."
          : `Há ${count} erros impedindo o envio.`}
      </div>
    </div>
  );
}

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
  const defaultTitle = initialValues?.title ?? "";
  const defaultAmount = initialValues
    ? toBRLInputFromCents(initialValues.amountCents)
    : "";
  const defaultDate = initialValues
    ? toYYYYMMDD(initialValues.occurredAt)
    : todayYYYYMMDD();
  const defaultNote = initialValues?.note ?? "";

  const initialType = initialValues?.type ?? "expense";
  const [type, setType] = useState<"income" | "expense">(initialType);

  // ✅ status (posted | scheduled)
  const initialStatus = initialValues?.status ?? "posted";
  const [status, setStatus] = useState<"posted" | "scheduled">(initialStatus);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.kind === type),
    [categories, type],
  );

  const defaultAccountId = initialValues?.accountId ?? accounts[0]?.id ?? "";
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccountId);

  const initialCategoryValue = useMemo(() => {
    if (initialValues?.categoryId) return initialValues.categoryId;

    const initialList = categories.filter((c) => c.kind === initialType);
    const first = firstCategoryIdOf(initialList);
    return first ?? INBOX_VALUE;
  }, [categories, initialType, initialValues?.categoryId]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(initialCategoryValue);

  const safeSelectedCategoryId = useMemo(() => {
    if (selectedCategoryId === INBOX_VALUE) return INBOX_VALUE;
    if (isValidCategoryId(selectedCategoryId, filteredCategories))
      return selectedCategoryId;
    return firstCategoryIdOf(filteredCategories) ?? INBOX_VALUE;
  }, [filteredCategories, selectedCategoryId]);

  const categoryIdToSubmit =
    safeSelectedCategoryId === INBOX_VALUE ? "" : safeSelectedCategoryId;

  const [titleValue, setTitleValue] = useState(defaultTitle);
  const [amountValue, setAmountValue] = useState(defaultAmount);
  const [dateValue, setDateValue] = useState(defaultDate);

  const [triedSubmit, setTriedSubmit] = useState(false);
  const [touched, setTouched] = useState<Touched>({});

  const snapshot = useMemo(
    () => ({
      title: titleValue,
      amount: amountValue,
      type,
      status,
      accountId: selectedAccountId,
      categoryId: categoryIdToSubmit,
      date: dateValue,
    }),
    [
      titleValue,
      amountValue,
      type,
      status,
      selectedAccountId,
      categoryIdToSubmit,
      dateValue,
    ],
  );

  const liveErrors = useMemo(() => validateSnapshot(snapshot), [snapshot]);
  const isValid = useMemo(() => Object.keys(liveErrors).length === 0, [liveErrors]);

  const shouldShowFieldError = useCallback(
    (field: keyof FormErrors) => triedSubmit || !!touched[field],
    [triedSubmit, touched],
  );

  const fieldError = useCallback(
    (field: keyof FormErrors) =>
      shouldShowFieldError(field) ? liveErrors[field] : undefined,
    [liveErrors, shouldShowFieldError],
  );

  const bannerCount = useMemo(() => {
    if (!triedSubmit) return 0;
    return Object.keys(liveErrors).length;
  }, [liveErrors, triedSubmit]);

  const showBanner = triedSubmit && bannerCount > 0;

  const markTouched = useCallback((field: keyof FormErrors) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const focusFirstError = useCallback((nextErrors: FormErrors) => {
    const order: (keyof FormErrors)[] = [
      "title",
      "amount",
      "type",
      "status",
      "accountId",
      "categoryId",
      "date",
    ];

    const first = order.find((k) => nextErrors[k]);
    const ids: Record<keyof FormErrors, string> = {
      title: "title",
      amount: "amount",
      type: "type-select",
      status: "status-select",
      accountId: "account-select",
      categoryId: "category-select",
      date: "date",
    };

    if (!first) return;
    const el = document.getElementById(ids[first]);
    el?.focus?.();
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      setTriedSubmit(true);

      if (!isValid) {
        e.preventDefault();
        setTouched({
          title: true,
          amount: true,
          type: true,
          status: true,
          accountId: true,
          categoryId: true,
          date: true,
        });
        focusFirstError(liveErrors);
      }
    },
    [focusFirstError, isValid, liveErrors],
  );

  const typeLabel = type === "income" ? "Entrada" : "Saída";

  return (
    <form action={action} className="space-y-6" onSubmit={onSubmit} noValidate>
      {showBanner ? <ErrorBanner count={bannerCount} /> : null}

      {mode === "edit" ? (
        <input type="hidden" name="id" value={initialValues?.id ?? ""} />
      ) : null}

      {/* ✅ hidden inputs usados pela action */}
      <input type="hidden" name="type" value={type} readOnly />
      <input type="hidden" name="status" value={status} readOnly />
      <input type="hidden" name="accountId" value={selectedAccountId} readOnly />
      <input type="hidden" name="categoryId" value={categoryIdToSubmit} readOnly />

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
              aria-invalid={!!fieldError("title")}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => markTouched("title")}
            />
            {fieldError("title") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("title")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Dica: prefira nomes curtos para facilitar a busca.
              </p>
            )}
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
                aria-invalid={!!fieldError("amount")}
                onChange={(e) => setAmountValue(e.target.value)}
                onBlur={() => markTouched("amount")}
              />
            </div>
            {fieldError("amount") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("amount")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Aceita vírgula e milhar (ex: 1.234,56).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                const nextType = v as "income" | "expense";
                setType(nextType);
                markTouched("type");
                markTouched("categoryId");

                const nextList = categories.filter((c) => c.kind === nextType);
                const first = firstCategoryIdOf(nextList);
                setSelectedCategoryId(first ?? INBOX_VALUE);
              }}
            >
              <SelectTrigger id="type-select" aria-invalid={!!fieldError("type")}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Saída</SelectItem>
                <SelectItem value="income">Entrada</SelectItem>
              </SelectContent>
            </Select>

            {fieldError("type") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("type")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Categorias serão filtradas para {typeLabel.toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

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
              value={selectedAccountId}
              onValueChange={(v) => {
                setSelectedAccountId(v);
                markTouched("accountId");
              }}
              disabled={!defaultAccountId}
            >
              <SelectTrigger id="account-select" aria-invalid={!!fieldError("accountId")}>
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

            {fieldError("accountId") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("accountId")}
              </p>
            ) : !defaultAccountId ? (
              <p className="text-xs text-muted-foreground">
                Crie uma conta para registrar transações.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Categoria
            </Label>

            {/* ✅ não desabilita: sempre dá pra escolher Inbox */}
            <Select
              value={safeSelectedCategoryId}
              onValueChange={(v) => {
                setSelectedCategoryId(v);
                markTouched("categoryId");
              }}
            >
              <SelectTrigger
                id="category-select"
                aria-invalid={!!fieldError("categoryId")}
              >
                <SelectValue
                  placeholder={
                    filteredCategories.length === 0
                      ? `Sem categorias de ${typeLabel.toLowerCase()}`
                      : "Selecione"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={INBOX_VALUE}>Sem categoria (Inbox)</SelectItem>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {fieldError("categoryId") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("categoryId")}
              </p>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Você ainda não tem categorias de {typeLabel.toLowerCase()}.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/categories/new?kind=${type}`}>Criar categoria</Link>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Se você deixar sem categoria, o Valette pode aplicar uma regra automática
                (se existir).
              </p>
            )}
          </div>

          <div className="space-y-2 sm:max-w-xs">
            <Label className="inline-flex items-center gap-2" htmlFor="date">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              aria-invalid={!!fieldError("date")}
              onChange={(e) => setDateValue(e.target.value)}
              onBlur={() => markTouched("date")}
            />
            {fieldError("date") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("date")}
              </p>
            ) : null}
          </div>

          {/* ✅ Status (Efetivada / Agendada) */}
          <div className="space-y-2 sm:max-w-xs">
            <Label className="inline-flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Status
            </Label>

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as "posted" | "scheduled");
                markTouched("status");
              }}
            >
              <SelectTrigger id="status-select" aria-invalid={!!fieldError("status")}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">Efetivada</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
              </SelectContent>
            </Select>

            {fieldError("status") ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldError("status")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Agendada aparece no mês da data e entra no resumo como agendada.
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

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

      <div className="flex items-center justify-end gap-2 rounded-xl border bg-muted/20 p-3">
        <Button asChild type="button" variant="outline">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>

        <SubmitButton label={submitLabel} disabled={!isValid} />
      </div>
    </form>
  );
}
