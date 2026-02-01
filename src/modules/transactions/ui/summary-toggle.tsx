"use client";

import { CalendarClock } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function buildQueryString(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params.toString());

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }

  return next.toString();
}

function parseShowScheduled(value: string | null) {
  // default: true (URL limpa)
  if (value === null) return true;
  if (value === "0" || value === "false") return false;
  return true;
}

export function TransactionsSummaryToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const checked = useMemo(
    () => parseShowScheduled(params.get("showScheduled")),
    [params],
  );

  const onChange = useCallback(
    (nextChecked: boolean) => {
      // default ON não precisa persistir na URL
      const qs = buildQueryString(params, {
        showScheduled: nextChecked ? null : "0",
      });

      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [params, pathname, router],
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border bg-card/70 px-3 py-2",
        "backdrop-blur supports-[backdrop-filter]:bg-card/55",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl border bg-background/60 text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
        </div>

        <div className="leading-tight">
          <Label className="text-sm font-medium">Mostrar agendadas</Label>
          <div className="text-xs text-muted-foreground">
            Exibe a linha “Agendadas” no resumo do período.
          </div>
        </div>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label="Mostrar agendadas no resumo"
      />
    </div>
  );
}
