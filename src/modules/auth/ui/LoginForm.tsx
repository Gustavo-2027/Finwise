"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/modules/auth/actions/login";

/**
 * Form de login (Client Component).
 * - chama Server Action
 * - mostra toast
 * - redireciona para next (se existir) ou /dashboard
 */
export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();

  const safeNext = useMemo(() => {
    // Segurança: evita open redirect (não deixa ir pra URL externa)
    if (!nextPath) return "/dashboard";
    if (!nextPath.startsWith("/")) return "/dashboard";
    return nextPath;
  }, [nextPath]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanEmail = email.trim();

    // Validação simples (rápida e objetiva)
    if (!cleanEmail || !password.trim()) {
      toast.error("Preencha email e senha.");
      return;
    }

    setIsPending(true);

    try {
      const result = await loginAction(cleanEmail, password);

      if (!result.ok) {
        // Mensagem amigável para o cenário comum do Supabase (email não confirmado)
        const message = result.message?.includes("Email not confirmed")
          ? "Confirme seu email antes de entrar."
          : result.message || "Falha ao entrar.";

        toast.error(message);
        return;
      }

      toast.success("Login realizado!");
      router.push(safeNext);

      // Garante refresh no App Router (pra server components pegarem a sessão)
      router.refresh();
    } catch {
      toast.error("Erro inesperado ao entrar.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta do Finwise</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
