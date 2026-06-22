"use client";

import { PlayerGridCard } from "./PlayerGridCard";
import { TeamLeaders } from "./TeamLeaders";
import { groupLabel } from "@/lib/data/percentile";
import type { AnalyzedPlayer, Anomaly, PositionGroup } from "@/lib/data/types";

// Лінії як на тактичній схемі: воротар (низ) → захист → півзахист → атака.
// Кожна лінія — ряд карток по центру. Дає відчуття футбольного поля.
const LINES: PositionGroup[] = ["Attacker", "Midfielder", "Defender", "Goalkeeper"];

export function TeamSquad({ players, anomalies }: { players: AnalyzedPlayer[]; anomalies: Anomaly[] }) {
  const byLine = LINES.map((g) => ({
    group: g,
    players: players
      .filter((p) => p.group === g)
      .sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0)),
  })).filter((s) => s.players.length > 0);

  let idx = 0;

  return (
    <div>
      {/* Hero — лідери команди */}
      <TeamLeaders players={players} />

      {/* Аномалії */}
      {anomalies.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ margin: "0 0 10px" }}>Помітне в команді</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {anomalies.map((a, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center",
                background: "var(--surface)", border: "1px solid var(--glass-border)",
                backdropFilter: "blur(var(--blur))", borderRadius: "var(--r-md)",
                padding: "10px 14px",
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 999, flexShrink: 0,
                  background: a.kind === "elite" ? "#1d9e75" : a.kind === "concern" ? "#dd4b4b" : "var(--club-accent)",
                }} />
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                  <strong style={{ color: "var(--text-1)", fontWeight: 500 }}>{a.playerName}</strong>
                  {" — "}{a.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Склад по лініях (тактична розкладка) */}
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>Склад за позиціями</p>
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(29,158,117,0.05), rgba(29,158,117,0.02))",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-lg)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}>
        {byLine.map((line) => (
          <div key={line.group}>
            <p style={{
              fontSize: 10, color: "var(--text-3)", textTransform: "uppercase",
              letterSpacing: "0.08em", margin: "0 0 10px", textAlign: "center",
              fontFamily: "var(--font-mono-stack)",
            }}>
              {groupLabel(line.group)}
            </p>
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12,
            }}>
              {line.players.map((p) => {
                const card = (
                  <div key={p.playerId} style={{ width: 160 }}>
                    <PlayerGridCard player={p} index={idx} />
                  </div>
                );
                idx += 1;
                return card;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
