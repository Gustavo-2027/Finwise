import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Finwise",
  description: "App de finanças pessoais (portfólio)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
