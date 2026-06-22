"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { groupShort } from "@/lib/data/percentile";
import type { AnalyzedPlayer } from "@/lib/data/types";

export function PlayerGridCard({ player, index }: { player: AnalyzedPlayer; index: number }) {
  const topStrength = player.strengths[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay: 0.03 * index, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/players/${player.playerId}`}>
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="pg-card"
          style={{
            position: "relative",
            background: "var(--surface)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(var(--blur))",
            WebkitBackdropFilter: "blur(var(--blur))",
            borderRadius: "var(--r-md)",
            padding: "14px 14px 12px",
            overflow: "visible",
            height: "100%",
          }}
        >
          {/* фото, що виступає за верх картки */}
          <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginTop: -22,
              background: "var(--surface-strong)",
              border: "1px solid var(--glass-border)",
              overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}>
              {player.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={player.photo} alt={player.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
                    viewTransitionName: `player-photo-${player.playerId}`,
                  }}
                  onError={(e) => { (e.currentTarget.style.display = "none"); }}
                />
              ) : null}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 500, color: "var(--club-accent)",
              background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border-soft)",
              borderRadius: 6, padding: "2px 7px",
            }}>
              {groupShort(player.group)}
            </span>
          </div>

          <p style={{
            fontSize: 14, fontWeight: 700, margin: "0 0 2px", color: "var(--text-1)",
            fontFamily: "var(--font-display-stack)", letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {player.name}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 10px" }}>
            <span className="stat-num">#{player.shirtNumber}</span> · {player.primaryPosition}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              {topStrength ? topStrength.metric : "—"}
            </span>
            <span className="stat-num" style={{
              fontSize: 15, fontWeight: 600,
              color: (player.rating ?? 0) >= 7 ? "#0f6e56" : "var(--text-2)",
            }}>
              {player.rating?.toFixed(2)}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
