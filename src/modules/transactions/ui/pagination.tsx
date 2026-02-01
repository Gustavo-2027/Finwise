"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";

function buildQueryString(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params);

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }

  return next.toString();
}

export function TransactionsPagination({
  page,
  totalPages,
  total,
}: {
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // snapshot estável do params atual (mantém month/q/type/etc)
  const baseParams = useMemo(() => new URLSearchParams(params.toString()), [params]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const safe = Math.min(totalPages, Math.max(1, nextPage));

      const qs = buildQueryString(new URLSearchParams(baseParams.toString()), {
        page: safe === 1 ? null : String(safe), // ✅ se página 1, remove do URL
      });

      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [baseParams, pathname, router, totalPages],
  );

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Total: <span className="font-medium text-foreground">{total}</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Página <span className="font-medium text-foreground">{page}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground">
        Total: <span className="font-medium text-foreground">{total}</span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        <div className="rounded-full border bg-background/50 px-3 py-1 text-xs text-muted-foreground">
          Página <span className="font-medium text-foreground">{page}</span> de{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Próxima
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
