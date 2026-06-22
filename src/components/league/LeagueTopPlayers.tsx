"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LeagueTopPlayers as TopData, LeagueTopPlayer } from "@/lib/data/types";

type Tab = "rated" | "scorers" | "assists";

const TABS: { key: Tab; label: string; unit: string }[] = [
  { key: "rated", label: "Рейтинг", unit: "" },
  { key: "scorers", label: "Бомбардири", unit: "голів" },
  { key: "assists", label: "Асистенти", unit: "асистів" },
];

export function LeagueTopPlayers({ data }: { data: TopData }) {
  const [tab, setTab] = useState<Tab>("rated");

  const list: LeagueTopPlayer[] =
    tab === "rated" ? data.topRated : tab === "scorers" ? data.topScorers : data.topAssists;
  const unit = TABS.find((t) => t.key === tab)?.unit ?? "";

  if (data.topRated.length === 0 && data.topScorers.length === 0) return null;

  return (
    <div>
      <p className="section-title">Лідери ліги</p>

      {/* перемикач */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                fontFamily: "var(--font-mono-stack)", fontSize: 12, letterSpacing: "0.04em",
                textTransform: "uppercase", padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                border: "1px solid var(--glass-border)",
                background: active ? "var(--text-1)" : "var(--surface)",
                color: active ? "#fff" : "var(--text-2)",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* список */}
      <div style={{ position: "relative", minHeight: 60 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {list.map((p, i) => (
              <Link
                key={p.playerId}
                href={`/players/${p.playerId}`}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--surface)", border: "1px solid var(--glass-border)",
                  borderRadius: "var(--r-md)", padding: "10px 14px",
                }}
              >
                <span className="stat-num" style={{ width: 18, color: "var(--text-3)", fontSize: 14 }}>
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photo} alt={p.name}
                  style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", flexShrink: 0 }}
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.teamLogo} alt="" style={{ width: 13, height: 13, objectFit: "contain" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{p.teamName}</span>
                  </div>
                </div>
                <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span className="stat-num" style={{
                    fontSize: 18, fontWeight: 700,
                    color: tab === "rated" ? "#0f6e56" : "var(--text-1)",
                  }}>
                    {tab === "rated" ? p.value.toFixed(2) : p.value}
                  </span>
                  {unit && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{unit}</span>}
                </span>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
