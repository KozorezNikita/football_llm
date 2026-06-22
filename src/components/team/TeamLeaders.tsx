"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { AnalyzedPlayer } from "@/lib/data/types";

// Hero-ряд: 3 ключові гравці команди — рейтинг, бомбардир, асистент.
// Велика картка з фото, що виступає за верх, і метрикою-героєм.

interface Leader {
  label: string;
  player: AnalyzedPlayer;
  value: string;
  metricLabel: string;
}

function pickLeaders(players: AnalyzedPlayer[]): Leader[] {
  const sig = players.filter((p) => p.significant);
  if (sig.length === 0) return [];
  const leaders: Leader[] = [];

  const byRating = [...sig].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  if (byRating) leaders.push({ label: "Найвищий рейтинг", player: byRating, value: byRating.rating?.toFixed(2) ?? "—", metricLabel: "рейтинг" });

  const byGoals = [...sig].sort((a, b) => b.goals - a.goals)[0];
  if (byGoals && byGoals.goals > 0) leaders.push({ label: "Бомбардир", player: byGoals, value: String(byGoals.goals), metricLabel: "голів" });

  const byAssists = [...sig].sort((a, b) => b.assists - a.assists)[0];
  if (byAssists && byAssists.assists > 0) leaders.push({ label: "Асистент", player: byAssists, value: String(byAssists.assists), metricLabel: "асистів" });

  return leaders;
}

export function TeamLeaders({ players }: { players: AnalyzedPlayer[] }) {
  const leaders = pickLeaders(players);
  if (leaders.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <p className="eyebrow" style={{ margin: "0 0 12px" }}>Лідери команди</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${leaders.length}, 1fr)`, gap: 14 }}>
        {leaders.map((l, i) => (
          <motion.div
            key={l.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/players/${l.player.playerId}`}>
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
                  padding: "0 16px 16px",
                  marginTop: 26,
                  overflow: "visible",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{
                    width: 76, height: 88, marginTop: -26, flexShrink: 0,
                    position: "relative", zIndex: 2,
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                  }}>
                    {l.player.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.player.photo} alt={l.player.name}
                        style={{
                          width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center",
                        }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                  </div>
                  <div style={{ textAlign: "right", paddingTop: 14 }}>
                    <AnimatedNumber
                      value={Number(l.value)}
                      decimals={l.metricLabel === "рейтинг" ? 2 : 0}
                      className="stat-num"
                      style={{ fontSize: 30, fontWeight: 700, display: "block", color: "var(--club-accent)", lineHeight: 1 }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{l.metricLabel}</span>
                  </div>
                </div>
                <p className="eyebrow" style={{ margin: "10px 0 4px" }}>{l.label}</p>
                <p style={{
                  fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-1)",
                  fontFamily: "var(--font-display-stack)", textTransform: "uppercase", letterSpacing: "-0.01em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {l.player.name}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
