"use client";

import Link from "next/link";
import type { LeagueTopPlayers } from "@/lib/data/types";

interface CardData {
  label: string;
  unit: string;
  player?: { playerId: number; name: string; photo: string; value: number };
  isRating?: boolean;
}

function LeaderCard({ c }: { c: CardData }) {
  if (!c.player) return null;
  const p = c.player;
  return (
    <Link href={`/players/${p.playerId}`} style={{
      display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0,
      background: "var(--surface)", border: "1px solid var(--glass-border)",
      borderRadius: "var(--r-md)", padding: "12px 16px",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.photo} alt={p.name}
        style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", background: "var(--surface-strong)", flexShrink: 0 }}
        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="eyebrow" style={{ margin: "0 0 3px" }}>{c.label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.name}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span className="stat-num" style={{ fontSize: 20, fontWeight: 700, color: c.isRating ? "#0f6e56" : "var(--text-1)" }}>
          {c.isRating ? p.value.toFixed(2) : p.value}
        </span>
        {c.unit && <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0 }}>{c.unit}</p>}
      </div>
    </Link>
  );
}

export function TeamLeaderCards({ data }: { data: LeagueTopPlayers }) {
  const cards: CardData[] = [
    { label: "Найвищий рейтинг", unit: "", isRating: true, player: data.topRated[0] },
    { label: "Бомбардир", unit: "голів", player: data.topScorers[0] },
    { label: "Асистент", unit: "асистів", player: data.topAssists[0] },
  ];
  const visible = cards.filter((c) => c.player);
  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 12, width: "100%" }}>
      {visible.map((c, i) => <LeaderCard key={i} c={c} />)}
    </div>
  );
}
