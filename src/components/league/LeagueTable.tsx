"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crest } from "@/components/ui/Crest";
import { getClubTheme, safeAccentOnLight } from "@/lib/theme/clubColors";
import type { TeamRow } from "@/lib/data/types";

export function LeagueTable({ teams }: { teams: TeamRow[] }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--glass-border)",
      backdropFilter: "blur(var(--blur))",
      WebkitBackdropFilter: "blur(var(--blur))",
      borderRadius: "var(--r-lg)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "32px minmax(0, 1fr) 40px 72px 48px 48px",
        gap: 8, padding: "12px 18px",
        borderBottom: "1px solid var(--hairline)",
        fontSize: 11, color: "var(--text-3)", textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        <span>#</span><span>Клуб</span>
        <span style={{ textAlign: "center" }}>М</span>
        <span style={{ textAlign: "center" }}>В-Н-П</span>
        <span style={{ textAlign: "center" }}>±</span>
        <span style={{ textAlign: "right" }}>Очки</span>
      </div>

      {teams.map((t, i) => {
        const accent = safeAccentOnLight(getClubTheme(t.id).primary);
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/teams/${t.id}`} style={{ display: "block" }}>
              <div
                className="lt-row"
                style={{
                  display: "grid", gridTemplateColumns: "32px minmax(0, 1fr) 40px 72px 48px 48px",
                  gap: 8, padding: "10px 18px", alignItems: "center",
                  borderBottom: i < teams.length - 1 ? "1px solid var(--hairline)" : "none",
                  position: "relative",
                }}
              >
                <span className="stat-num" style={{
                  fontSize: 14, fontWeight: 600, color: "var(--text-2)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    width: 3, height: 18, borderRadius: 2, background: accent,
                  }} />
                  {t.position}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <Crest name={t.name} logo={t.logo} size={28} accent={accent} />
                  <span style={{
                    fontSize: 14, color: "var(--text-1)", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{t.name}</span>
                </span>
                <span className="stat-num" style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>{t.played}</span>
                <span className="stat-num" style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)", whiteSpace: "nowrap" }}>
                  {t.wins}-{t.draws}-{t.losses}
                </span>
                <span className="stat-num" style={{
                  textAlign: "center", fontSize: 13,
                  color: (t.goalDiff ?? 0) > 0 ? "#0f6e56" : (t.goalDiff ?? 0) < 0 ? "#a32d2d" : "var(--text-2)",
                }}>
                  {(t.goalDiff ?? 0) > 0 ? "+" : ""}{t.goalDiff}
                </span>
                <span className="stat-num" style={{ textAlign: "right", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
                  {t.points}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
      <style>{`.lt-row:hover { background: var(--surface-hover); }`}</style>
    </div>
  );
}
