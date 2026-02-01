// src/app/(app)/transactions/loading.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";

function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-background/40 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      {/* Main card skeleton */}
      <Card className="overflow-hidden bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-base">
                <Skeleton className="h-4 w-28" />
              </CardTitle>
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-5 p-0">
          {/* Filters section */}
          <div className="space-y-4 px-4 pt-5 sm:px-6">
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-52" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-10 w-full sm:max-w-sm" />
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Skeleton className="h-10 w-full sm:w-44" />
                <Skeleton className="h-10 w-full sm:w-40" />
                <Skeleton className="h-10 w-full sm:w-24" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Table skeleton */}
          <div className="px-4 pb-5 sm:px-6">
            <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
              <div className="grid grid-cols-12 border-b bg-muted/30 px-4 py-2">
                <Skeleton className="col-span-4 h-3 w-20" />
                <Skeleton className="col-span-2 h-3 w-16" />
                <Skeleton className="col-span-2 h-3 w-14" />
                <Skeleton className="col-span-2 h-3 w-10" />
                <Skeleton className="col-span-2 ml-auto h-3 w-12" />
              </div>

              <div className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 px-4 py-3">
                    <div className="col-span-4 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="col-span-2 ml-auto">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile table skeleton */}
            <div className="grid gap-2 md:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Pagination skeleton */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-7 w-36 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
