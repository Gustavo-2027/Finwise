// src/app/(app)/transactions/new/loading.tsx
import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-[22rem] max-w-full" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Tip card skeleton (mesma vibe do card de dica real) */}
      <div className="overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-[28rem] max-w-full" />
              <Skeleton className="h-4 w-[20rem] max-w-full" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      </div>

      {/* Form card skeleton */}
      <div className="overflow-hidden rounded-xl border bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
        <div className="border-b px-6 py-4">
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Banner de erro (não aparece sempre na real, mas ajuda a “preencher” visual) */}
          <div className="hidden">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-56" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-44" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Classificação */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>

              <div className="space-y-2 sm:max-w-xs">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2 sm:max-w-xs">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Extras */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 rounded-xl border bg-muted/20 p-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
