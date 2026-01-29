import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkText,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
}) {
  return (
    <main className="min-h-[calc(100vh-4rem)] w-full">
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        {/* Fundo sutil */}
        <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_60%_at_50%_0%,hsl(var(--muted))_0%,transparent_60%)]" />

        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-1">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border bg-background">
              <span className="text-sm font-semibold">FW</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {children}

          <p className="text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="text-foreground underline underline-offset-4"
            >
              {footerLinkText}
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Dica: se o login falhar após o cadastro, confirme o email no link enviado.
          </p>
        </div>
      </div>
    </main>
  );
}
