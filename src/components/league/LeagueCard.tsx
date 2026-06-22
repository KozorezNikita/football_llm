"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LeagueInfo } from "@/lib/data/types";

export function LeagueCard({ league, index }: { league: LeagueInfo; index: number }) {
  const topTeams = league.teams.slice(0, 3);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/leagues/${league.id}`}>
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="noise edge-light"
          style={{
            position: "relative",
            background: "var(--surface-strong)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(var(--blur))",
            WebkitBackdropFilter: "blur(var(--blur))",
            borderRadius: "var(--r-xl)",
            padding: "22px 22px 18px",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            {league.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={league.logo} alt={league.name}
                style={{ width: 44, height: 44, objectFit: "contain" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            )}
            <div>
              <p style={{
                fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-1)",
                fontFamily: "var(--font-display-stack)", textTransform: "uppercase", letterSpacing: "-0.01em",
              }}>
                {league.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>
                {league.country} · {league.season}
              </p>
            </div>
          </div>

          {topTeams.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topTeams.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span className="stat-num" style={{ color: "var(--text-3)", width: 16 }}>{t.position}</span>
                  {t.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo} alt="" style={{ width: 16, height: 16, objectFit: "contain" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <span style={{ color: "var(--text-2)", flex: 1 }}>{t.name}</span>
                  <span className="stat-num" style={{ color: "var(--text-1)", fontWeight: 600 }}>{t.points}</span>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 12, color: "var(--club-accent)", margin: "14px 0 0", fontWeight: 500 }}>
            {league.teams.length} команд →
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
