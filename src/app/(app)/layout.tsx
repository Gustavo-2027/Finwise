import type { ReactNode } from "react";

import { supabaseServer } from "@/infrastructure/supabase/server";
import { AppHeader } from "@/shared/ui/app-header/page";

/**
 * Layout do grupo (app).
 * - Busca usuário no SSR para preencher o header
 * - Aplica shell premium (fundo + container + painel)
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  const userEmail = data.user?.email ?? undefined;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Background premium: glow + grid bem sutil */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 [background:radial-gradient(55%_55%_at_50%_0%,hsl(var(--accent))_0%,transparent_60%)] opacity-50" />
        <div className="absolute inset-0 [background:radial-gradient(35%_35%_at_15%_20%,hsl(var(--muted))_0%,transparent_55%)] opacity-50" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <AppHeader userEmail={userEmail} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6">
        {/* App frame */}
        <div className="relative">
          {/* brilho de borda (ring) */}
          <div className="pointer-events-none absolute -inset-1 rounded-[1.35rem] bg-gradient-to-b from-primary/15 via-transparent to-transparent blur-xl opacity-70" />

          {/* painel */}
          <section className="relative overflow-hidden rounded-[1.25rem] border bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
            {/* topo sutil */}
            <div className="border-b bg-background/40 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none">Finwise</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {userEmail ? `Sessão: ${userEmail}` : "Sessão ativa"}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/70" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>

            {/* conteúdo */}
            <div className="p-4 sm:p-6">
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                {children}
              </div>
            </div>
          </section>
        </div>

        {/* footer */}
        <footer className="mt-6 flex flex-col items-center justify-between gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            Finwise • Portfólio
          </span>
          <span>Next.js • Supabase • shadcn/ui</span>
        </footer>
      </main>
    </div>
  );
}
