import { AuthShell } from "@/modules/auth/ui/AuthShell";
import { LoginForm } from "@/modules/auth/ui/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta do Valette"
      footerText="Não tem conta?"
      footerHref="/register"
      footerLinkText="Criar conta"
    >
      <LoginForm nextPath={searchParams?.next} />
    </AuthShell>
  );
}
