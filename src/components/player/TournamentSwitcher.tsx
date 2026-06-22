"use client";

import { motion } from "framer-motion";
import type { PlayerTournament } from "@/lib/data/types";

interface Props {
  tournaments: PlayerTournament[];
  activeId: number;
  onSelect: (tournamentId: number) => void;
}

// Перемикач турнірів. Показуємо лише якщо турнірів > 1.
// Активна вкладка підсвічена клубним акцентом; під нею — анімований індикатор.
export function TournamentSwitcher({ tournaments, activeId, onSelect }: Props) {
  if (tournaments.length <= 1) return null;

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
      {tournaments.map((t) => {
        const active = t.tournamentId === activeId;
        return (
          <button
            key={t.tournamentId}
            onClick={() => onSelect(t.tournamentId)}
            style={{
              position: "relative",
              border: "1px solid var(--glass-border)",
              background: active ? "var(--surface-strong)" : "var(--surface)",
              backdropFilter: "blur(var(--blur))",
              WebkitBackdropFilter: "blur(var(--blur))",
              borderRadius: 999,
              padding: "7px 14px",
              cursor: "pointer",
              fontSize: 13,
              color: active ? "var(--pat-accent, var(--club-accent))" : "var(--text-2)",
              fontWeight: active ? 600 : 400,
              transition: "color 0.2s, background 0.2s",
            }}
          >
            {t.tournamentName}
            <span className="stat-num" style={{
              marginLeft: 8, fontSize: 11, opacity: 0.7,
            }}>
              {t.matches} матч.
            </span>
            {active && (
              <motion.span
                layoutId="tournament-dot"
                style={{
                  position: "absolute", bottom: -1, left: "50%",
                  width: 18, height: 2, borderRadius: 2,
                  background: "var(--pat-accent, var(--club-accent))", transform: "translateX(-50%)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
