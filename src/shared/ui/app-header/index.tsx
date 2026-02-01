"use client";

import { Check, Laptop, LogOut, Menu, Moon, Palette, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/modules/auth/actions/logout";
import {
  COLOR_THEME_STORAGE_KEY,
  type ColorTheme,
  colorTheme,
} from "@/shared/providers/theme-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Contas" },
  { href: "/transactions", label: "Transações" },
  { href: "/import", label: "Importar CSV" },
  { href: "/rules", label: "Regras" },
  { href: "/settings", label: "Configurações" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitialsFromEmail(email?: string) {
  if (!email) return "??";
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[^a-zA-Z0-9]/g, "");
  const first = cleaned[0]?.toUpperCase();
  const second = cleaned[1]?.toUpperCase();
  return `${first ?? "?"}${second ?? "?"}`;
}

function getThemeLabel(theme?: string) {
  if (theme === "light") return "Claro";
  if (theme === "dark") return "Escuro";
  return "Sistema";
}

function getColorThemeLabel(t: ColorTheme) {
  if (t === "bordo-goiaba") return "Bordô";
  return "Azul";
}

function ColorSwatch({ theme }: { theme: ColorTheme }) {
  const cls =
    theme === "bordo-goiaba" ? "bg-[rgb(176,28,55)]" : "bg-[oklch(0.62_0.16_250)]";

  return (
    <span
      className={cn(
        "mr-2 inline-grid h-4 w-4 place-items-center rounded-full",
        "ring-2 ring-background shadow-sm",
        cls,
      )}
      aria-hidden="true"
    />
  );
}

function BrandMark({ palette }: { palette: ColorTheme }) {
  const dot =
    palette === "bordo-goiaba" ? "bg-[rgb(176,28,55)]" : "bg-[oklch(0.62_0.16_250)]";

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("h-2.5 w-2.5 rounded-full shadow-sm", dot)}
        aria-hidden="true"
      />
      <span className="font-semibold tracking-tight">Valette</span>
      <span className="hidden sm:inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {getColorThemeLabel(palette)}
      </span>
    </div>
  );
}

function NavPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-foreground/5 text-foreground"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function AppHeader({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = useMemo(() => getInitialsFromEmail(userEmail), [userEmail]);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [palette, setPalette] = useState<ColorTheme>("blue");

  useEffect(() => {
    setMounted(true);
    const initial = colorTheme.read();
    setPalette(initial);
    colorTheme.apply(initial);
  }, []);

  const handleProfileClick = useCallback(() => {
    toast("Perfil", { description: "Tela de perfil entra na próxima etapa." });
  }, []);

  const handleThemeSelect = useCallback(
    (next: "system" | "light" | "dark") => {
      setTheme(next);
      toast("Tema", { description: `Tema alterado para: ${getThemeLabel(next)}` });
    },
    [setTheme],
  );

  const handleColorThemeSelect = useCallback((next: ColorTheme) => {
    setPalette(next);
    colorTheme.apply(next);

    try {
      window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, next);
    } catch {}

    toast("Paleta", { description: `Paleta: ${getColorThemeLabel(next)}` });
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logoutAction();
      toast.success("Você saiu da sua conta.");

      setMobileOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b",
        "bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
        "shadow-[0_1px_0_0_hsl(var(--border)/0.9)]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn("md:hidden", "bg-background/60 hover:bg-background/80")}
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 sm:w-[360px]">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <BrandMark palette={palette} />
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <Separator className="my-4" />

              <nav aria-label="Navegação principal (mobile)" className="grid gap-1">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        active
                          ? "bg-foreground/5 text-foreground"
                          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Separator className="my-4" />

              <div className="space-y-2 rounded-2xl border bg-background/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Logado como</div>
                    <div className="truncate text-sm font-medium">{userEmail ?? "—"}</div>
                  </div>

                  <span className="inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {getColorThemeLabel(palette)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Tema:{" "}
                  <span className="font-medium text-foreground">
                    {mounted ? getThemeLabel(theme) : "—"}
                  </span>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/dashboard"
            className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <BrandMark palette={palette} />
          </Link>
        </div>

        {/* Center */}
        <nav aria-label="Navegação principal" className="hidden md:flex">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full border",
              "bg-background/50 p-1 shadow-sm",
            )}
          >
            {navItems.map((item) => (
              <NavPill
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </div>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "hidden sm:inline-flex",
              "bg-background/60 hover:bg-background/80",
            )}
            onClick={() =>
              toast("Ajuda", {
                description: "Conteúdo de ajuda/documentação entra depois.",
              })
            }
          >
            Ajuda
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-background/60 hover:bg-background/80"
                aria-label="Abrir menu da conta"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span>Minha conta</span>
                {userEmail ? (
                  <span className="text-xs font-normal text-muted-foreground">
                    {userEmail}
                  </span>
                ) : null}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Tema
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => handleThemeSelect("system")}
                disabled={!mounted}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <Laptop className="mr-2 h-4 w-4" />
                  Sistema
                </span>
                {mounted && theme === "system" ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleThemeSelect("light")}
                disabled={!mounted}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <Sun className="mr-2 h-4 w-4" />
                  Claro
                </span>
                {mounted && theme === "light" ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleThemeSelect("dark")}
                disabled={!mounted}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <Moon className="mr-2 h-4 w-4" />
                  Escuro
                </span>
                {mounted && theme === "dark" ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Paleta
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => handleColorThemeSelect("blue")}
                disabled={!mounted}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  <ColorSwatch theme="blue" />
                  Azul
                </span>
                {mounted && palette === "blue" ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleColorThemeSelect("bordo-goiaba")}
                disabled={!mounted}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  <ColorSwatch theme="bordo-goiaba" />
                  Bordô
                </span>
                {mounted && palette === "bordo-goiaba" ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
