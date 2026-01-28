"use client";

import { LogOut, Menu, Moon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Contas" },
  { href: "/transactions", label: "Transações" },
  { href: "/import", label: "Importar CSV" },
  { href: "/rules", label: "Regras" },
  { href: "/settings", label: "Configurações" },
];

function isActivePath(pathname: string, href: string) {
  // Ex: /transactions e /transactions/new devem marcar "Transações"
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleProfileClick() {
    toast("Perfil", {
      description: "Tela de perfil entra na próxima etapa.",
    });
  }

  function handleThemeClick() {
    toast("Tema", {
      description: "Alternância de tema será implementada depois.",
    });
  }

  function handleLogoutClick() {
    toast.error("Sair", {
      description: "Logout será integrado com o Supabase no Dia 2.",
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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
                Auth entra no Dia 2 (Supabase).
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
                  <AvatarFallback className="text-xs">GS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleThemeClick}>
                <Moon className="mr-2 h-4 w-4" />
                Tema
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogoutClick}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
