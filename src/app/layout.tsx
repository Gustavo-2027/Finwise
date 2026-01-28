import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finwise",
  description: "App de finanças pessoais (portfólio) — Next.js + TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
