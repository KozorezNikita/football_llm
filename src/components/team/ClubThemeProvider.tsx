"use client";

import { useEffect, type ReactNode } from "react";
import { getClubTheme, safeAccentOnLight } from "@/lib/theme/clubColors";

// Встановлює клубні кольори як CSS-змінні на рівні сторінки.
// Усі компоненти всередині читають --club-accent тощо й автоматично перевдягаються.
export function ClubThemeProvider({ teamId, children }: { teamId: number; children: ReactNode }) {
  const theme = getClubTheme(teamId);
  const accent = safeAccentOnLight(theme.accent);
  const primary = safeAccentOnLight(theme.primary);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--club-primary", primary);
    root.style.setProperty("--club-secondary", theme.secondary);
    root.style.setProperty("--club-accent", accent);
    return () => {
      root.style.removeProperty("--club-primary");
      root.style.removeProperty("--club-secondary");
      root.style.removeProperty("--club-accent");
    };
  }, [primary, accent, theme.secondary]);

  return <>{children}</>;
}
