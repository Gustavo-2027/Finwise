"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { useEffect } from "react";

export type ColorTheme = "blue" | "bordo-goiaba";

export const COLOR_THEME_STORAGE_KEY = "valette:color-theme";

function readColorThemeFromStorage(): ColorTheme {
  if (typeof window === "undefined") return "blue";
  const raw = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (raw === "bordo-goiaba" || raw === "blue") return raw;
  return "blue";
}

function applyColorTheme(theme: ColorTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Mantém "blue" como default sem poluir o DOM.
  if (theme === "blue") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Aplica paleta no client ASAP após hidratação.
  // Para eliminar 100% o flash, usamos também um script no RootLayout (abaixo).
  useEffect(() => {
    const initial = readColorThemeFromStorage();
    applyColorTheme(initial);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

// Exporte helpers para usar no Header
export const colorTheme = {
  read: readColorThemeFromStorage,
  apply: applyColorTheme,
};
