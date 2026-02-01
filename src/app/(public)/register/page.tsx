import { AuthShell } from "@/modules/auth/ui/AuthShell";
import { RegisterForm } from "@/modules/auth/ui/RegisterForm";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return (
    <AuthShell
      title="Criar conta"
      description="Comece a organizar suas finanças no Valette"
      footerText="Já tem conta?"
      footerHref="/login"
      footerLinkText="Entrar"
    >
      <RegisterForm nextPath={searchParams?.next} />
    </AuthShell>
  );
}
