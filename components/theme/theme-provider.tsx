"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Initial check: Add light class if theme is light (next-themes only adds dark class)
    // This runs once on mount to sync the initial state
    const checkInitialTheme = () => {
      const html = document.documentElement;
      const hasDark = html.classList.contains("dark");
      const hasLight = html.classList.contains("light");
      
      // Only update if there's a mismatch
      if (!hasDark && !hasLight) {
        // No theme class means it's light (defaultTheme is light, but check localStorage)
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "light" || !storedTheme) {
          html.classList.add("light");
        }
      } else if (hasDark && hasLight) {
        html.classList.remove("light");
      }
    };

    // Small delay to let next-themes initialize first
    const initialTimeout = setTimeout(checkInitialTheme, 100);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

