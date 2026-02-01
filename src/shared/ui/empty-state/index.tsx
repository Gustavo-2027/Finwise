import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card/60 p-6 text-center backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="mx-auto flex max-w-md flex-col items-center gap-2">
        {icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-xl border bg-background/50">
            {icon}
          </div>
        ) : null}

        <h3 className="mt-1 text-base font-semibold">{title}</h3>

        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}

        {actions ? <div className="mt-3">{actions}</div> : null}
      </div>
    </div>
  );
}
