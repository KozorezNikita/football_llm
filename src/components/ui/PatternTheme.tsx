"use client";

import { useEffect } from "react";
import { LEAGUE_PALETTES } from "@/components/ui/LeaguePattern";

// Виставляє CSS-змінні патерна на <body> під лігу сторінки.
// Глобальний LeaguePattern (fixed, у body) читає ці змінні й перефарбовується
// БЕЗ перемонтування → без блимання при переходах.

const DEFAULT = { base: "#0e1320", shape: "#1c2438", accent: "#3a5bbf", glow: "#4a6cd4" };

export function PatternTheme({ leagueId }: { leagueId: number | null }) {
  useEffect(() => {
    const p = (leagueId != null && LEAGUE_PALETTES[leagueId]) || DEFAULT;
    const b = document.body.style;
    b.setProperty("--pat-base", p.base);
    b.setProperty("--pat-shape", p.shape);
    b.setProperty("--pat-accent", p.accent);
    b.setProperty("--pat-glow", p.glow);
  }, [leagueId]);

  return null;
}
