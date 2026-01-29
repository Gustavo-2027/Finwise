"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function buildQueryString(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params);

  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  });

  return next.toString();
}

export function TransactionsFilters({
  initialQuery,
  initialMonth,
  initialType,
}: {
  initialQuery: string;
  initialMonth: string;
  initialType: "all" | "income" | "expense";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Estado controlado do input/select (precisa disso pro debounce + UX)
  const [q, setQ] = useState(initialQuery);
  const [month, setMonth] = useState(initialMonth);
  const [type, setType] = useState<"all" | "income" | "expense">(initialType);

  const pushWithPatch = useMemo(() => {
    return (patch: Record<string, string | null>) => {
      const qs = buildQueryString(new URLSearchParams(params.toString()), patch);
      router.push(qs ? `${pathname}?${qs}` : pathname);
    };
  }, [params, pathname, router]);

  // Debounce da busca (atualiza URL)
  useEffect(() => {
    const t = setTimeout(() => {
      pushWithPatch({ q: q.trim() || null, page: "1" });
    }, 350);

    return () => clearTimeout(t);
  }, [q, pushWithPatch]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição, categoria, conta..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <Select
          value={month}
          onValueChange={(v) => {
            setMonth(v);
            pushWithPatch({ month: v, page: "1" });
          }}
        >
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">Este mês</SelectItem>
            <SelectItem value="last-month">Último mês</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(v) => {
            const next = v as "all" | "income" | "expense";
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
      </div>
    </div>
  );
}
