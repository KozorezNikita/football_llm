"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TypedTagline } from "./TypedTagline";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";
import type { LeagueInfo } from "@/lib/data/types";

// Вітрина команд: капсула з назвою ліги + два ряди логотипів,
// що розлітаються від центру назовні (чергуючи боки) при вході.
// Капсула має view-transition-name — морфиться з головної (split panels).

// Розбиває команди на 2 ряди.
function splitRows<T>(items: T[]): [T[], T[]] {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

// Порядок появи в ряду: від центру назовні, чергуючи боки.
// Повертає мапу index → порядковий номер появи.
function centerOutOrder(n: number): number[] {
  const mid = (n - 1) / 2;
  const idxs = Array.from({ length: n }, (_, i) => i);
  idxs.sort((a, b) => {
    const da = Math.abs(a - mid), db = Math.abs(b - mid);
    if (da !== db) return da - db;
    return a < mid ? -1 : 1; // лівий бік трохи раніше за симетричний правий
  });
  const order = new Array(n);
  idxs.forEach((idx, pos) => { order[idx] = pos; });
  return order;
}

function Row({ teams, startDelay, animate = true }: { teams: LeagueInfo["teams"]; startDelay: number; animate?: boolean }) {
  const n = teams.length;
  const order = centerOutOrder(n);
  const mid = (n - 1) / 2;

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "nowrap" }}>
      {teams.map((t, i) => {
        const fromLeft = i < mid;
        const delay = startDelay + order[i] * 0.1;
        return (
          <motion.div
            key={t.id}
            initial={animate ? { opacity: 0, x: fromLeft ? 180 : -180, y: -120, scale: 0.3 } : false}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={animate ? { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          >
            <Link
              href={`/teams/${t.id}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, width: 96 }}
            >
              <motion.div
                whileHover={{ y: -5, scale: 1.08 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 72, height: 72, borderRadius: 18,
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {t.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logo} alt={t.name}
                    style={{
                      width: 52, height: 52, objectFit: "contain",
                      viewTransitionName: `team-logo-${t.id}`,
                    }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
              </motion.div>
              <span style={{
                fontFamily: "var(--font-mono-stack)", fontSize: 10.5, textTransform: "uppercase",
                letterSpacing: "0.03em", color: "var(--text-2)", textAlign: "center",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 96,
              }}>
                {t.name}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function LeagueShowcase({ league }: { league: LeagueInfo }) {
  const [row1, row2] = splitRows(league.teams);
  const row2Start = 0.4 + row1.length * 0.1; // другий ряд після першого
  const animate = useFirstVisit(`showcase:${league.id}`);

  return (
    <div style={{ padding: "8px 0 36px" }}>
      {/* капсула з назвою + гасло друкується ВСЕРЕДИНІ капсули */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <div
          style={{
            background: "rgba(8,10,16,0.72)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "14px 40px",
            display: "flex", alignItems: "baseline", gap: 14,
            viewTransitionName: `league-capsule-${league.id}`,
          }}
        >
          <h1 className="display" style={{
            fontSize: 44, color: "#fff", textTransform: "uppercase",
            margin: 0, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap",
          }}>
            {league.name}
          </h1>
          <TypedTagline leagueId={league.id} animate={animate} />
        </div>
      </div>

      {/* два ряди логотипів — проміжна сцена (темніша за контент, світліша за капсулу) */}
      <div className="content-surface-mid">
        <p className="section-title">Команди</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, overflow: "hidden" }}>
          <Row teams={row1} startDelay={0.4} animate={animate} />
          {row2.length > 0 && <Row teams={row2} startDelay={row2Start} animate={animate} />}
        </div>
      </div>
    </div>
  );
}
