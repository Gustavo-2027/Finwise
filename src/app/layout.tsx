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
      <body className="bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
