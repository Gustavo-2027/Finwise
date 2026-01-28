import { AppHeader } from "@/shared/ui/app-header/page";
import { Breadcrumbs } from "@/shared/ui/breadcrumbs/page";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Breadcrumbs />
        {children}
      </main>
    </div>
  );
}
