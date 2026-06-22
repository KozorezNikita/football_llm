"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SquadReport, SlotAnalysis, Priority } from "@/lib/data/squadAnalysis";
import { ScoutReport } from "./ScoutReport";

const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#d64545",    // червоний — потребує підсилення
  medium: "#e0a020",  // жовтий — тонко
  low: "#2fae6a",     // зелений — укомплектовано
};
const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Потребує підсилення",
  medium: "Тонко",
  low: "Укомплектовано",
};

const LINE_ORDER = ["ATT", "MID", "DEF", "GK"] as const;

// ── Поле (візуально ідентичне Best XI) ──
function Field({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "absolute", inset: 0, backfaceVisibility: "hidden",
      borderRadius: "var(--r-lg)", overflow: "hidden",
      background: "linear-gradient(180deg, #0f5733 0%, #167a47 45%, #1c8a51 100%)",
      padding: "26px 22px",
      border: "2px solid var(--pat-accent, rgba(255,255,255,0.2))",
      boxShadow: "inset 0 0 90px rgba(0,0,0,0.35), 0 8px 30px rgba(0,0,0,0.25)",
      display: "flex", flexDirection: "column",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 44px, rgba(0,0,0,0.04) 44px, rgba(0,0,0,0.04) 88px)",
      }} />
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 8% 6%, rgba(255,255,255,0.18), transparent 28%),
          radial-gradient(circle at 92% 6%, rgba(255,255,255,0.18), transparent 28%),
          radial-gradient(circle at 8% 94%, rgba(255,255,255,0.12), transparent 28%),
          radial-gradient(circle at 92% 94%, rgba(255,255,255,0.12), transparent 28%)
        `,
      }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "#fff" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 90, height: 90, transform: "translate(-50%,-50%)", border: "2px solid #fff", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 0, left: "50%", width: 180, height: 66, transform: "translateX(-50%)", border: "2px solid #fff", borderBottom: "none", borderRadius: "4px 4px 0 0" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", width: 180, height: 66, transform: "translateX(-50%)", border: "2px solid #fff", borderTop: "none", borderRadius: "0 0 4px 4px" }} />
        <div style={{ position: "absolute", bottom: 0, left: "50%", width: 90, height: 28, transform: "translateX(-50%)", border: "2px solid #fff", borderBottom: "none" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", width: 90, height: 28, transform: "translateX(-50%)", border: "2px solid #fff", borderTop: "none" }} />
      </div>
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        boxShadow: "inset 0 -40px 60px rgba(0,0,0,0.2), inset 0 40px 50px rgba(0,0,0,0.25)",
      }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function PlayerDot({ s, index }: { s: SlotAnalysis; index: number }) {
  const color = PRIORITY_COLOR[s.priority];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 84 }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: color, border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: `0 0 14px ${color}aa, 0 2px 6px rgba(0,0,0,0.3)`,
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.7)", whiteSpace: "nowrap", maxWidth: 84, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>
        {s.starter ? s.starter.name.split(" ").pop() : "—"}
      </span>
      <span className="stat-num" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 2px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>
        {s.starterRating != null ? s.starterRating.toFixed(2) : "—"} · гл.{s.depth}
      </span>
    </motion.div>
  );
}

function FieldRow({ slots, startIndex }: { slots: SlotAnalysis[]; startIndex: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flex: 1 }}>
      {slots.map((s, i) => <PlayerDot key={`${s.line}-${s.x}-${i}`} s={s} index={startIndex + i} />)}
    </div>
  );
}

export function SquadNeeds({ report, teamId, initialReport }: { report: SquadReport; teamId: number; initialReport?: string | null }) {
  const [flipped, setFlipped] = useState(false);

  const byLine = (line: string) =>
    report.slots.filter((s) => s.line === line).sort((a, b) => a.x - b.x);

  // зони підсилення (проблемні зверху)
  const needs = report.slots
    .filter((s) => s.priority !== "low")
    .sort((a, b) => {
      const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });

  let idx = 0;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 440px) minmax(0, 1fr)", gap: 24, alignItems: "stretch" }} className="needs-grid">
        {/* ЛІВО: шапка над полем + flip (поле ⇄ список підсилень) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <p className="section-title" style={{ margin: 0 }}>Аналіз складу</p>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>
              Основна формація: <b style={{ color: "var(--text-2)" }}>{report.formation}</b>
            </span>
            <button onClick={() => setFlipped((v) => !v)} title="Поле / підсилення" style={{
              marginLeft: "auto", width: 34, height: 34, borderRadius: 999, cursor: "pointer",
              border: "1px solid var(--glass-border)", background: flipped ? "var(--text-1)" : "var(--surface)",
              color: flipped ? "#fff" : "var(--text-2)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}>⇄</button>
          </div>
          <div style={{ perspective: 1800, minHeight: 460, flex: 1 }}>
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", transformStyle: "preserve-3d", width: "100%", height: "100%", minHeight: 460 }}
          >
            {/* ФРОНТ: поле */}
            <Field>
              {LINE_ORDER.map((line) => {
                const slots = byLine(line);
                if (slots.length === 0) return null;
                const row = <FieldRow key={line} slots={slots} startIndex={idx} />;
                idx += slots.length;
                return row;
              })}
            </Field>

            {/* ЗВОРОТ: список підсилень */}
            <div style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
              borderRadius: "var(--r-lg)", border: "1px solid var(--glass-border)",
              background: "var(--surface-strong)", padding: "20px 18px",
              display: "flex", flexDirection: "column", gap: 14, overflowY: "auto",
            }}>
              <p className="eyebrow" style={{ margin: 0 }}>Пріоритети підсилення</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: needs.length <= 3 ? "center" : "flex-start" }}>
                {needs.length === 0 ? (
                  <p style={{ fontSize: 14, color: "var(--text-2)", textAlign: "center" }}>
                    Склад збалансований — критичних прогалин не виявлено.
                  </p>
                ) : (
                  needs.map((s) => (
                    <div key={`${s.line}-${s.x}`} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "var(--surface)", border: "1px solid var(--glass-border)",
                      borderLeft: `3px solid ${PRIORITY_COLOR[s.priority]}`,
                      borderRadius: "var(--r-md)", padding: "12px 14px",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: 0 }}>
                          {s.label}{s.side === "L" ? " (лівий)" : s.side === "R" ? " (правий)" : ""}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>
                          {s.starter ? `${s.starter.name} · ${s.starterRating?.toFixed(2)}` : "немає гравця"}
                          {" · "}глибина: {s.depth}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLOR[s.priority], whiteSpace: "nowrap" }}>
                        {PRIORITY_LABEL[s.priority]}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
          </div>
        </div>

        {/* ПРАВО: ШІ-вердикт */}
        <div className="content-surface" style={{ display: "flex", flexDirection: "column" }}>
          <ScoutReport teamId={teamId} initialReport={initialReport} />
        </div>
      </div>
    </div>
  );
}
