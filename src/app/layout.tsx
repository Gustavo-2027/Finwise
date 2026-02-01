import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import {
  COLOR_THEME_STORAGE_KEY,
  ThemeProvider,
} from "@/shared/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Valette",
    template: "%s • Valette",
  },
  description: "Valette — controle financeiro pessoal com automação inteligente.",
  applicationName: "Valette",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const applyColorThemeInlineScript = `
(function () {
  try {
    var key = "${COLOR_THEME_STORAGE_KEY}";
    var raw = localStorage.getItem(key);
    if (raw === "bordo-goiaba") {
      document.documentElement.dataset.theme = "bordo-goiaba";
    } else {
      delete document.documentElement.dataset.theme;
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyColorThemeInlineScript }} />
      </head>

      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-right" duration={3500} />
      </body>
    </html>
  );
}
