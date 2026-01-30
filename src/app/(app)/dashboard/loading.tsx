// src/app/(app)/dashboard/loading.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton/page";

function StatSkeleton() {
  return (
    <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-background/40 px-3 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <Skeleton className="h-4 w-4 rounded-sm" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </section>

      {/* Main content */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Latest transactions */}
        <Card className="lg:col-span-2 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="text-base">
                  <Skeleton className="h-4 w-36" />
                </CardTitle>
                <Skeleton className="h-3 w-56" />
              </div>

              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-3 pt-6">
            <div className="divide-y rounded-xl border bg-background/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-56" />
                    </div>

                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
          <CardHeader className="pb-3">
            <div className="space-y-2">
              <CardTitle className="text-base">
                <Skeleton className="h-4 w-28" />
              </CardTitle>
              <Skeleton className="h-3 w-48" />
            </div>
          </CardHeader>

          <CardContent className="grid gap-2">
            <QuickActionSkeleton />
            <QuickActionSkeleton />
            <QuickActionSkeleton />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
