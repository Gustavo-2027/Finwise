import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type TxType = "all" | "income" | "expense";
type MonthFilter = "this-month" | "last-month" | string;

function formatBRLFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildHref(base: { q: string; month: MonthFilter; type: TxType; page: number }) {
  const p = new URLSearchParams();

  if (base.q) p.set("q", base.q);
  if (base.month && base.month !== "this-month") p.set("month", base.month);
  if (base.type && base.type !== "all") p.set("type", base.type);
  if (base.page && base.page !== 1) p.set("page", String(base.page));

  const qs = p.toString();
  return qs ? `/transactions?${qs}` : "/transactions";
}

function StatCard({
  title,
  value,
  hint,
  icon,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "neutral" | "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background/40 p-4 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-background/30",
        "transition-colors hover:bg-muted/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{title}</div>
          <div
            className={cn(
              "mt-2 text-lg font-semibold tracking-tight tabular-nums",
              tone === "success" && "text-emerald-600 dark:text-emerald-400",
              tone === "danger" && "text-rose-600 dark:text-rose-400",
            )}
          >
            {value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        </div>

        <div
          className={cn(
            "rounded-lg border p-2",
            tone === "success" &&
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            tone === "danger" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            tone === "neutral" && "bg-muted/30 text-muted-foreground",
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function TransactionsSummaryCards({
  rangeLabel,
  incomeCents,
  expenseCents,
  netCents,
  current,
}: {
  rangeLabel: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
  current: { q: string; month: MonthFilter; type: TxType };
}) {
  const netTone: "success" | "danger" | "neutral" =
    netCents > 0 ? "success" : netCents < 0 ? "danger" : "neutral";

  const linkClass = cn(
    "block rounded-xl",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  );

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        href={buildHref({ ...current, type: "income", page: 1 })}
        className={linkClass}
      >
        <StatCard
          title="Entradas"
          value={formatBRLFromCents(incomeCents)}
          hint={`No período: ${rangeLabel}`}
          tone="success"
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
      </Link>

      <Link
        href={buildHref({ ...current, type: "expense", page: 1 })}
        className={linkClass}
      >
        <StatCard
          title="Saídas"
          value={formatBRLFromCents(expenseCents)}
          hint={`No período: ${rangeLabel}`}
          tone="danger"
          icon={<ArrowDownRight className="h-4 w-4" />}
        />
      </Link>

      <Link href={buildHref({ ...current, type: "all", page: 1 })} className={linkClass}>
        <StatCard
          title="Saldo"
          value={formatBRLFromCents(netCents)}
          hint="Entradas − Saídas"
          tone={netTone}
          icon={<Scale className="h-4 w-4" />}
        />
      </Link>
    </div>
  );
}
