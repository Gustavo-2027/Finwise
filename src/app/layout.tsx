import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/shared/providers/theme-provider";

export const metadata: Metadata = {
  title: "Finwise",
  description: "App de finanças pessoais (portfólio)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>

        <Toaster richColors position="top-right" duration={3500} />
      </body>
    </html>
  );
}
