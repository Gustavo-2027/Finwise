"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MonthFilter,
  TxStatusFilter,
  TxTypeFilter,
} from "@/modules/transactions/types";

function buildQueryString(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  return next.toString();
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
) {
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Args) => {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(() => fn(...args), delayMs);
    },
    [fn, delayMs],
  );
}

function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthKeyFromOffset(offset: number) {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1, 12, 0, 0),
  );
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

function buildMonthsAround(pastCount: number, futureCount: number) {
  const past: string[] = [];
  const future: string[] = [];

  // passado começa em 2: evita duplicar last-month
  for (let i = 2; i < 2 + pastCount; i++) past.push(monthKeyFromOffset(-i));

  // futuro começa em 2: evita duplicar next-month
  for (let i = 2; i < 2 + futureCount; i++) future.push(monthKeyFromOffset(i));

  return { past, future };
}

export function TransactionsFilters({
  initialQuery,
  initialMonth,
  initialType,
  initialStatus,
}: {
  initialQuery: string;
  initialMonth: MonthFilter;
  initialType: TxTypeFilter;
  initialStatus: TxStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(initialQuery);
  const [month, setMonth] = useState<MonthFilter>(initialMonth);
  const [type, setType] = useState<TxTypeFilter>(initialType);
  const [status, setStatus] = useState<TxStatusFilter>(initialStatus);

  const { past: pastMonths, future: futureMonths } = useMemo(
    () => buildMonthsAround(12, 12),
    [],
  );

  const pushWithPatch = useCallback(
    (patch: Record<string, string | null>) => {
      const current = new URLSearchParams(params.toString());
      const qs = buildQueryString(current, patch);

      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      const currentUrl = current.toString()
        ? `${pathname}?${current.toString()}`
        : pathname;

      if (nextUrl === currentUrl) return;
      router.push(nextUrl);
    },
    [params, pathname, router],
  );

  const pushSearch = useDebouncedCallback<[string]>((value) => {
    const normalized = normalizeText(value);
    pushWithPatch({ q: normalized || null, page: "1" });
  }, 350);

  const hasActiveFilters = useMemo(() => {
    return (
      normalizeText(q).length > 0 ||
      month !== "this-month" ||
      type !== "all" ||
      status !== "all"
    );
  }, [q, month, type, status]);

  const clearSearch = useCallback(() => {
    setQ("");
    pushWithPatch({ q: null, page: "1" });
  }, [pushWithPatch]);

  const clearAll = useCallback(() => {
    setQ("");
    setMonth("this-month");
    setType("all");
    setStatus("all");
    pushWithPatch({
      q: null,
      month: "this-month",
      type: "all",
      status: "all",
      page: "1",
    });
  }, [pushWithPatch]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Buscar por título..."
          value={q}
          onChange={(e) => {
            const value = e.target.value;
            setQ(value);
            pushSearch(value);
          }}
          className="pl-9 pr-9"
          inputMode="search"
          aria-label="Buscar transações"
        />

        {normalizeText(q) ? (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/40"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {/* Month */}
        <Select
          value={month}
          onValueChange={(v) => {
            const next = v as MonthFilter;
            setMonth(next);
            pushWithPatch({ month: next, page: "1" });
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="this-month">Este mês</SelectItem>
            <SelectItem value="last-month">Último mês</SelectItem>
            <SelectItem value="next-month">Próximo mês</SelectItem>

            {futureMonths.length ? (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Próximos meses
                </div>
                {futureMonths.map((m) => (
                  <SelectItem key={`f-${m}`} value={m}>
                    {monthLabel(m)}
                  </SelectItem>
                ))}
              </>
            ) : null}

            {pastMonths.length ? (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Meses anteriores
                </div>
                {pastMonths.map((m) => (
                  <SelectItem key={`p-${m}`} value={m}>
                    {monthLabel(m)}
                  </SelectItem>
                ))}
              </>
            ) : null}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select
          value={type}
          onValueChange={(v) => {
            const next = v as TxTypeFilter;
            setType(next);
            pushWithPatch({ type: next, page: "1" });
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={status}
          onValueChange={(v) => {
            const next = v as TxStatusFilter;
            setStatus(next);
            pushWithPatch({ status: next, page: "1" });
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="posted">Efetivadas</SelectItem>
            <SelectItem value="scheduled">Agendadas</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={clearAll}
          disabled={!hasActiveFilters}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
