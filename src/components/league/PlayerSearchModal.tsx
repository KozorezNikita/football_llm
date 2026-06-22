"use client";

import { useState, useMemo } from "react";
import type { BestXIPlayer } from "@/lib/data/types";
import type { Role } from "@/lib/data/positionRoles";

interface Props {
  pool: BestXIPlayer[];
  slotRoles: Role[];      // ролі слоту (для топ-5 за замовчуванням)
  slotSide?: "L" | "R";
  usedIds: Set<number>;   // вже зайняті слоти
  onPick: (p: BestXIPlayer) => void;
  onClose: () => void;
}

export function PlayerSearchModal({ pool, slotRoles, slotSide, usedIds, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const available = pool.filter((p) => !usedIds.has(p.playerId));

    if (q) {
      // пошук по імені серед усіх гравців ліги
      return available.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 30);
    }

    // порожній інпут → топ-5 по точній ролі слоту (з урахуванням боку)
    const sideWord = slotSide === "L" ? "left" : slotSide === "R" ? "right" : null;
    let byRole = available.filter((p) => slotRoles.includes(p.role));
    if (sideWord) {
      const sided = byRole.filter((p) => p.primaryPosition.toLowerCase().includes(sideWord));
      if (sided.length >= 3) byRole = sided; // якщо достатньо бічних — показуємо їх
    }
    return byRole.slice(0, 5);
  }, [query, pool, slotRoles, slotSide, usedIds]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 20,
        background: "rgba(8,10,16,0.55)",
        backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        borderRadius: "var(--r-lg)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 360, maxHeight: "85%",
          background: "var(--surface-strong)", border: "1px solid var(--glass-border)",
          borderRadius: "var(--r-lg)", padding: 16,
          display: "flex", flexDirection: "column", gap: 12,
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p className="eyebrow" style={{ margin: 0 }}>Обрати гравця</p>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-3)", fontSize: 20, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук за іменем…"
          style={{
            width: "100%", padding: "10px 14px", borderRadius: "var(--r-md)",
            border: "1px solid var(--glass-border)", background: "var(--surface)",
            color: "var(--text-1)", fontSize: 14, outline: "none",
            fontFamily: "var(--font-body-stack)",
          }}
        />

        {!query.trim() && (
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
            Топ-5 на позицію за рейтингом
          </p>
        )}

        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {results.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", padding: "16px 0" }}>
              Нічого не знайдено
            </p>
          )}
          {results.map((p) => (
            <button
              key={p.playerId}
              onClick={() => onPick(p)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                background: "var(--surface)", border: "1px solid var(--glass-border)",
                borderRadius: "var(--r-md)", padding: "8px 10px", cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", flexShrink: 0 }}
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{p.primaryPosition}</p>
              </div>
              <span className="stat-num" style={{ fontSize: 14, fontWeight: 700, color: "#0f6e56" }}>
                {p.rating.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
