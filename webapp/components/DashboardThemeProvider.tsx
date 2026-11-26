"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

type Theme = "light" | "dark";
type DashboardThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const STORAGE_KEY = "habico-dashboard-theme";
const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";
const DashboardThemeContext =
  createContext<DashboardThemeContextValue | null>(null);

export function DashboardThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useLocalStorageValue(
    STORAGE_KEY,
    "light",
    isTheme,
    { onInvalid: "fallback" },
  );
  const toggleTheme = useCallback(
    () => setTheme((current) => (current === "light" ? "dark" : "light")),
    [setTheme],
  );

  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        data-dashboard-theme={theme}
        className="min-h-screen bg-habico-landing text-[var(--ink)]"
      >
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider.");
  }
  return context;
}
