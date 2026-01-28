"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Contas",
  transactions: "Transações",
  import: "Importar CSV",
  rules: "Regras",
  settings: "Configurações",
  new: "Novo",
};

function prettify(segment: string) {
  if (LABELS[segment]) return LABELS[segment];
  if (segment.startsWith("[") && segment.endsWith("]")) return "Detalhes";
  return segment;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Evita mostrar no login/register (mas como está no (app) layout, já não aparece)
  const parts = pathname.split("/").filter(Boolean);

  // Sempre começa no dashboard
  const crumbs = [{ href: "/dashboard", label: "Finwise" }];

  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    // não duplicar /dashboard no início
    if (acc === "/dashboard") continue;

    crumbs.push({
      href: acc,
      label: prettify(part),
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;

          return (
            <li key={c.href} className="flex items-center gap-2">
              {idx !== 0 && <span aria-hidden="true">/</span>}

              {isLast ? (
                <span className="text-foreground">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:text-foreground">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
