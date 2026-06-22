"use client";

// Глобальний тематичний фон-патерн. Рендериться ОДИН раз у layout (не блимає).
// Кольори бере з CSS-змінних, які виставляє кожна сторінка під свою лігу:
//   --pat-base, --pat-shape, --pat-accent, --pat-glow
// Зміна змінних перефарбовує фон БЕЗ перемонтування → без блимання.

export function LeaguePattern() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background: "linear-gradient(160deg, var(--pat-base, #0e1320) 0%, var(--pat-shape, #1c2438) 100%)",
        overflow: "hidden",
        transition: "background 0.6s ease",
      }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="lp-stripes" width="120" height="120" patternUnits="userSpaceOnUse"
            patternTransform="rotate(-20)">
            <rect width="120" height="120" fill="transparent" />
            <rect x="0" width="46" height="120" fill="var(--pat-shape, #1c2438)" opacity="0.55" />
          </pattern>
          <radialGradient id="lp-glow1" cx="20%" cy="15%" r="50%">
            <stop offset="0%" stopColor="var(--pat-glow, #4a6cd4)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--pat-glow, #4a6cd4)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lp-glow2" cx="85%" cy="80%" r="55%">
            <stop offset="0%" stopColor="var(--pat-accent, #3a5bbf)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--pat-accent, #3a5bbf)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1200" height="800" fill="url(#lp-stripes)" />
        <rect width="1200" height="800" fill="url(#lp-glow1)" />
        <rect width="1200" height="800" fill="url(#lp-glow2)" />
      </svg>

      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.12) 100%)",
      }} />
    </div>
  );
}

export interface LeaguePalette { base: string; shape: string; accent: string; glow: string; }

export const LEAGUE_PALETTES: Record<number, LeaguePalette> = {
  47: { base: "#1a0b2e", shape: "#3d1857", accent: "#e6107a", glow: "#7b2ff7" }, // EPL
  53: { base: "#0a1838", shape: "#15275a", accent: "#1f5fc4", glow: "#2d7ff0" }, // Ligue 1
  54: { base: "#1a0a0a", shape: "#3a1212", accent: "#d20515", glow: "#ff3b3b" }, // Bundesliga
};

const DEFAULT_PALETTE: LeaguePalette = { base: "#0e1320", shape: "#1c2438", accent: "#3a5bbf", glow: "#4a6cd4" };

export function leaguePatternVars(leagueId: number | null): React.CSSProperties {
  const p = (leagueId != null && LEAGUE_PALETTES[leagueId]) || DEFAULT_PALETTE;
  return {
    ["--pat-base" as string]: p.base,
    ["--pat-shape" as string]: p.shape,
    ["--pat-accent" as string]: p.accent,
    ["--pat-glow" as string]: p.glow,
  };
}
