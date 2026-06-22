"use client";

import Link from "next/link";
import { useState } from "react";
import { getClubTheme, safeAccentOnDark } from "@/lib/theme/clubColors";
import type { LeagueInfo } from "@/lib/data/types";

// Кінематографічний екран вибору ліги: вертикальні панелі на повну висоту,
// при наведенні активна розширюється (flex), решта стискаються.
// Фон — фото ліги (з /public/leagues/{id}.jpg), або градієнт-фолбек.

// Мапа фонових фото. Поклади свої файли в public/leagues/ і впиши тут.
// Якщо файлу нема — спрацює градієнт-фолбек (кольори нижче).
const LEAGUE_BG: Record<number, string> = {
  53: "/leagues/ligue1.jpg",
  47: "/leagues/epl.jpg",
};

// Градієнт-фолбек у фірмових кольорах ліги (поки фото нема).
const LEAGUE_GRADIENT: Record<number, string> = {
  53: "linear-gradient(135deg, #091c3a 0%, #1a3a6e 55%, #c8102e 140%)", // Ligue 1
  47: "linear-gradient(135deg, #2d0a3e 0%, #3d195b 55%, #00ff85 160%)", // Premier League
};

const DEFAULT_GRADIENT = "linear-gradient(135deg, #1a1f2e 0%, #2a3550 100%)";

export function LeagueSplitPanels({ leagues }: { leagues: LeagueInfo[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="league-split"
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
      onMouseLeave={() => setHovered(null)}
    >
      {leagues.map((league) => {
        const isActive = hovered === league.id;
        const isDimmed = hovered !== null && !isActive;
        const accent = safeAccentOnDark(getClubTheme(league.teams[0]?.id).primary);
        const bg = LEAGUE_BG[league.id];
        const gradient = LEAGUE_GRADIENT[league.id] ?? DEFAULT_GRADIENT;

        return (
          <Link
            key={league.id}
            href={`/leagues/${league.id}`}
            onMouseEnter={() => setHovered(league.id)}
            style={{
              position: "relative",
              flex: isActive ? 2.6 : isDimmed ? 0.7 : 1,
              transition: "flex 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              overflow: "hidden",
              display: "block",
              minWidth: 0,
            }}
          >
            {/* фоновий шар: фото або градієнт */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: gradient,
                backgroundSize: "cover",
                backgroundPosition: "center",
                ...(bg ? { backgroundImage: `url(${bg})` } : {}),
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
            {/* затемнення для читабельності тексту */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: isActive
                  ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.78) 100%)"
                  : "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.82) 100%)",
                transition: "background 0.5s ease",
              }}
            />

            {/* акцентна лінія ліги зверху */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: accent,
              opacity: isActive ? 1 : 0.6,
              transition: "opacity 0.4s ease",
            }} />

            {/* контент */}
            <div
              style={{
                position: "relative",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "0 0 56px 0",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* скляна капсула з назвою ліги */}
                <div style={{
                  background: "rgba(8,10,16,0.72)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  padding: isActive ? "14px 36px" : "10px 26px",
                  transition: "padding 0.5s cubic-bezier(0.22,1,0.36,1)",
                  viewTransitionName: `league-capsule-${league.id}`,
                }}>
                  <h2
                    className="display"
                    style={{
                      fontSize: isActive ? 52 : 26,
                      color: "#fff",
                      textTransform: "uppercase",
                      margin: 0,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      transition: "font-size 0.5s cubic-bezier(0.22,1,0.36,1)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {league.name}
                  </h2>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
