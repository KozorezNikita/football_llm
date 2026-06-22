"use client";

import { useState, useEffect } from "react";

// Гасло ліги (друкована частина — те, що йде після назви в капсулі).
const TAGLINES: Record<number, string> = {
  47: "where football was born",
  53: "league of talents",
  54: "home of intensity",
};

export function TypedTagline({ leagueId, startDelay = 700, animate = true }: { leagueId: number; startDelay?: number; animate?: boolean }) {
  const full = TAGLINES[leagueId] ?? "";
  const [shown, setShown] = useState(animate ? "" : full);
  const [started, setStarted] = useState(!animate);

  useEffect(() => {
    if (!full || !animate) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [full, startDelay, animate]);

  useEffect(() => {
    if (!started || !full || !animate) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [started, full, animate]);

  if (!full || !started) return null;

  return (
    <span className="display" style={{
      fontSize: 44,
      textTransform: "uppercase",
      letterSpacing: "-0.02em",
      lineHeight: 1,
      color: "rgba(255,255,255,0.45)",
      whiteSpace: "nowrap",
    }}>
      — {shown}
      {shown.length < full.length && <span style={{ opacity: 0.6 }}>|</span>}
    </span>
  );
}
