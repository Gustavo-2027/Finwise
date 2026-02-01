import { ArrowDownRight, ArrowUpRight, CalendarClock, Scale } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type {
  MonthFilter,
  TxStatusFilter,
  TxTypeFilter,
} from "@/modules/transactions/types";

function formatBRLFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildHref(base: {
  q: string;
  month: MonthFilter;
  type: TxTypeFilter;
  status: TxStatusFilter;
  showScheduled?: boolean;
}) {
  const p = new URLSearchParams();

  if (base.q) p.set("q", base.q);
  if (base.month && base.month !== "this-month") p.set("month", base.month);
  if (base.type && base.type !== "all") p.set("type", base.type);
  if (base.status && base.status !== "all") p.set("status", base.status);

  // Default: true (URL limpa). Só persiste quando false.
  if (base.showScheduled === false) p.set("showScheduled", "0");

  const qs = p.toString();
  return qs ? `/transactions?${qs}` : "/transactions";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function ScheduledLine({
  label,
  valueCents,
  tone,
}: {
  label: string;
  valueCents: number;
  tone: "neutral" | "success" | "danger";
}) {
  if (!valueCents) return null;

  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border bg-background/40 px-2.5 py-1.5 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>

      <span
        className={cn(
          "font-medium tabular-nums",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "danger" && "text-rose-600 dark:text-rose-400",
          tone === "neutral" && "text-foreground",
        )}
      >
        {formatBRLFromCents(valueCents)}
      </span>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
  tone,
  showScheduled,
  scheduledCents = 0,
  scheduledTone = "neutral",
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "neutral" | "success" | "danger";
  showScheduled: boolean;
  scheduledCents?: number;
  scheduledTone?: "neutral" | "success" | "danger";
}) {
  const hasScheduled = scheduledCents > 0;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card/70 p-4 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-card/55",
        "transition-all",
        "hover:-translate-y-0.5 hover:bg-muted/10 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">{title}</div>
            {showScheduled && hasScheduled ? <Badge>Agendadas</Badge> : null}
          </div>

          <div
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
              tone === "success" && "text-emerald-600 dark:text-emerald-400",
              tone === "danger" && "text-rose-600 dark:text-rose-400",
            )}
          >
            {value}
          </div>

          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>

          {showScheduled ? (
            <ScheduledLine
              label="Previsto no período"
              valueCents={scheduledCents}
              tone={scheduledTone}
            />
          ) : null}
        </div>

        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition-colors",
            tone === "success" &&
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            tone === "danger" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            tone === "neutral" && "bg-muted/30 text-muted-foreground",
          )}
        >
          {icon}
        </div>
      </div>

      {/* Subtle focus/hover ring */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/50",
          "group-hover:ring-border/80",
        )}
      />
    </div>
  );
}

export function TransactionsSummaryCards({
  rangeLabel,
  display,
  summary,
  current,
}: {
  rangeLabel: string;
  display?: { includesScheduled?: boolean };
  summary: {
    incomeCents: number;
    expenseCents: number;
    netCents: number;
    scheduledIncomeCents: number;
    scheduledExpenseCents: number;
    scheduledNetCents: number;
  };
  current: {
    q: string;
    month: MonthFilter;
    type: TxTypeFilter;
    status: TxStatusFilter;
    showScheduled?: boolean;
  };
}) {
  // Fonte de verdade: URL (toggle). Se não vier, cai pro backend.
  const showScheduled = current.showScheduled ?? display?.includesScheduled ?? true;

  const netTone: "success" | "danger" | "neutral" =
    summary.netCents > 0 ? "success" : summary.netCents < 0 ? "danger" : "neutral";

  const scheduledNetTone: "success" | "danger" | "neutral" =
    summary.scheduledNetCents > 0
      ? "success"
      : summary.scheduledNetCents < 0
        ? "danger"
        : "neutral";

  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href={buildHref({ ...current, type: "income", showScheduled })}
          className={cn(
            "block rounded-2xl outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <StatCard
            title="Entradas"
            value={formatBRLFromCents(summary.incomeCents)}
            hint={`Período: ${rangeLabel}`}
            tone="success"
            icon={<ArrowUpRight className="h-4 w-4" />}
            showScheduled={showScheduled}
            scheduledCents={summary.scheduledIncomeCents}
            scheduledTone="success"
          />
        </Link>

        <Link
          href={buildHref({ ...current, type: "expense", showScheduled })}
          className={cn(
            "block rounded-2xl outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <StatCard
            title="Saídas"
            value={formatBRLFromCents(summary.expenseCents)}
            hint={`Período: ${rangeLabel}`}
            tone="danger"
            icon={<ArrowDownRight className="h-4 w-4" />}
            showScheduled={showScheduled}
            scheduledCents={summary.scheduledExpenseCents}
            scheduledTone="danger"
          />
        </Link>

        <Link
          href={buildHref({ ...current, type: "all", showScheduled })}
          className={cn(
            "block rounded-2xl outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <StatCard
            title="Saldo"
            value={formatBRLFromCents(summary.netCents)}
            hint="Entradas − Saídas"
            tone={netTone}
            icon={<Scale className="h-4 w-4" />}
            showScheduled={showScheduled}
            scheduledCents={summary.scheduledNetCents}
            scheduledTone={scheduledNetTone}
          />
        </Link>
      </div>

      {showScheduled ? (
        <p className="text-xs text-muted-foreground">
          Agendadas são previsões para o período e não entram no saldo efetivado.
        </p>
      ) : null}
    </div>
  );
}
