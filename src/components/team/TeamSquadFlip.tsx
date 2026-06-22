"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";
import type { PlayerProfile, PositionGroup } from "@/lib/data/types";

const GROUP_ORDER: PositionGroup[] = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
const GROUP_LABEL: Record<string, string> = {
  Goalkeeper: "Воротарі",
  Defender: "Захисники",
  Midfielder: "Півзахисники",
  Attacker: "Нападники",
};

const FOTMOB_PHOTO = (id: number) =>
  `https://images.fotmob.com/image_resources/playerimages/${id}.png`;

function byGroup(players: PlayerProfile[]) {
  const map: Record<string, PlayerProfile[]> = {};
  for (const g of GROUP_ORDER) map[g] = [];
  for (const p of players) {
    const g = p.group ?? "Midfielder";
    (map[g] ??= []).push(p);
  }
  for (const g of Object.keys(map)) {
    map[g].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  return map;
}

// ── картка гравця (режим карток) ──
function SquadCard({ p, index, vt, animate }: { p: PlayerProfile; index: number; vt: boolean; animate: boolean }) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { duration: 0.35, delay: index * 0.02 } : { duration: 0 }}
    >
      <Link href={`/players/${p.playerId}`} style={{
        display: "flex", flexDirection: "column", gap: 8,
        background: "var(--surface)", border: "1px solid var(--glass-border)",
        borderRadius: "var(--r-md)", padding: 12, height: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo ?? FOTMOB_PHOTO(p.playerId)} alt={p.name}
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", background: "var(--surface-strong)", viewTransitionName: vt ? `player-photo-${p.playerId}` : undefined }}
              onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.name}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0" }}>
              {p.shirtNumber != null ? `#${p.shirtNumber} · ` : ""}{p.primaryPosition ?? "—"}
            </p>
          </div>
          {p.rating != null && (
            <span className="stat-num" style={{ fontSize: 15, fontWeight: 700, color: "#0f6e56" }}>
              {p.rating.toFixed(2)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── рядок гравця (режим списку, à la Transfermarkt) ──
function SquadRow({ p, vt }: { p: PlayerProfile; vt: boolean }) {
  return (
    <Link href={`/players/${p.playerId}`} style={{
      display: "grid", gridTemplateColumns: "32px 1fr 60px 50px 50px 56px",
      gap: 10, alignItems: "center", padding: "9px 12px",
      borderBottom: "1px solid var(--hairline)",
    }}>
      <span className="stat-num" style={{ color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>
        {p.shirtNumber ?? "—"}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photo ?? FOTMOB_PHOTO(p.playerId)} alt={p.name}
          style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", background: "var(--surface-strong)", flexShrink: 0, viewTransitionName: vt ? `player-photo-${p.playerId}` : undefined }}
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-1)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p.name}
          </p>
          <p style={{ fontSize: 10.5, color: "var(--text-3)", margin: 0 }}>{p.primaryPosition ?? "—"}</p>
        </div>
      </div>
      <span className="stat-num" style={{ fontSize: 12, color: "var(--text-2)", textAlign: "center" }}>
        {p.matches ?? 0} <span style={{ color: "var(--text-3)", fontSize: 10 }}>матч</span>
      </span>
      <span className="stat-num" style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>{p.goals}</span>
      <span className="stat-num" style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>{p.assists}</span>
      <span className="stat-num" style={{ fontSize: 14, fontWeight: 700, color: p.rating != null ? "#0f6e56" : "var(--text-3)", textAlign: "right" }}>
        {p.rating != null ? p.rating.toFixed(2) : "—"}
      </span>
    </Link>
  );
}

export function TeamSquadFlip({ players }: { players: PlayerProfile[] }) {
  const animate = useFirstVisit("team-squad");
  const [listMode, setListMode] = useState(false);
  const grouped = byGroup(players);
  const groups = GROUP_ORDER.filter((g) => grouped[g]?.length > 0);

  let cardIdx = 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
        <p className="section-title" style={{ margin: 0 }}>Склад команди</p>
        <button onClick={() => setListMode((v) => !v)} title="Вид" style={{
          width: 34, height: 34, borderRadius: 999, cursor: "pointer",
          border: "1px solid var(--glass-border)", background: listMode ? "var(--text-1)" : "var(--surface)",
          color: listMode ? "#fff" : "var(--text-2)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
        }}>⇄</button>
      </div>

      <div style={{ perspective: 1800 }}>
        <motion.div
          animate={{ rotateY: listMode ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", transformStyle: "preserve-3d" }}
        >
          {/* ФРОНТ — картки по позиціях */}
          <div style={{ backfaceVisibility: "hidden" }}>
            {groups.map((g) => (
              <div key={g} style={{ marginBottom: 20 }}>
                <p className="eyebrow" style={{ margin: "0 0 10px" }}>{GROUP_LABEL[g]}</p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: 10,
                }}>
                  {grouped[g].map((p) => <SquadCard key={p.playerId} p={p} index={cardIdx++} vt={!listMode} animate={animate} />)}
                </div>
              </div>
            ))}
          </div>

          {/* ЗВОРОТ — список з розділювачами по позиціях */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflowY: "auto" }}>
            {groups.map((g) => (
              <div key={g} style={{ marginBottom: 12 }}>
                <p className="eyebrow" style={{
                  margin: "0 0 4px", padding: "6px 12px",
                  background: "var(--surface-strong)", borderRadius: "var(--r-sm)",
                }}>{GROUP_LABEL[g]} · {grouped[g].length}</p>
                {/* шапка колонок */}
                <div style={{
                  display: "grid", gridTemplateColumns: "32px 1fr 60px 50px 50px 56px",
                  gap: 10, padding: "4px 12px", fontSize: 10, color: "var(--text-3)",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  <span style={{ textAlign: "center" }}>#</span><span>Гравець</span>
                  <span style={{ textAlign: "center" }}>Матчі</span>
                  <span style={{ textAlign: "center" }}>Г</span>
                  <span style={{ textAlign: "center" }}>А</span>
                  <span style={{ textAlign: "right" }}>Рейт</span>
                </div>
                {grouped[g].map((p) => <SquadRow key={p.playerId} p={p} vt={listMode} />)}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
