"use client";

import { Check, Laptop, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
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

export function AppHeader({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = useMemo(() => getInitialsFromEmail(userEmail), [userEmail]);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Evita mismatch de hidratação ao ler theme/resolvedTheme
    setMounted(true);
  }, []);

  function handleProfileClick() {
    toast("Perfil", { description: "Tela de perfil entra na próxima etapa." });
  }

  function handleThemeSelect(next: "system" | "light" | "dark") {
    setTheme(next);

    toast("Tema", {
      description: `Tema alterado para: ${getThemeLabel(next)}`,
    });
  }

  async function handleLogout() {
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
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-70 sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/dashboard"
                    className="font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Finwise
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
                        "rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Separator className="my-4" />

              <div className="text-xs text-muted-foreground">
                {userEmail ? `Logado como ${userEmail}` : "Autenticação via Supabase."}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="font-semibold">
            Finwise
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <nav aria-label="Navegação principal" className="hidden md:flex md:gap-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Help + Account dropdown */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
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
              <Button variant="outline" size="icon" aria-label="Abrir menu da conta">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
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
