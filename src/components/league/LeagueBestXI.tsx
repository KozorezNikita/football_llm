"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BestXIPlayer } from "@/lib/data/types";
import { FORMATIONS, type Slot } from "@/lib/data/positionRoles";
import { PlayerSearchModal } from "./PlayerSearchModal";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";

interface Placed { player: BestXIPlayer; x: number; }

// ролі за лініями — для обмеження фолбеку
const LINE_ROLES: Record<string, string[]> = {
  GK: ["GK"],
  DEF: ["CB", "FB", "WB"],
  MID: ["DM", "CM", "AM", "WM"],
  ATT: ["W", "ST"],
};

function fillLine(slots: Slot[], pool: BestXIPlayer[], usedIds: Set<number>, line: string): Placed[] {
  const placed: Placed[] = [];
  const allowed = LINE_ROLES[line] ?? [];
  for (const slot of slots) {
    let chosen: BestXIPlayer | null = null;
    const sideWord = slot.side === "L" ? "left" : slot.side === "R" ? "right" : null;
    for (const role of slot.roles) {
      const sameRole = pool.filter((p) => p.role === role && !usedIds.has(p.playerId));
      if (sameRole.length === 0) continue;
      if (sideWord) {
        const sided = sameRole.find((p) => p.primaryPosition.toLowerCase().includes(sideWord));
        if (sided) { chosen = sided; break; }
      }
      chosen = sameRole[0];
      break;
    }
    // фолбек — лише гравець ТІЄЇ Ж ЛІНІЇ (щоб захисник не став нападником)
    if (!chosen) {
      const cand = pool.find((p) => allowed.includes(p.role) && !usedIds.has(p.playerId));
      if (cand) chosen = cand;
    }
    if (chosen) {
      usedIds.add(chosen.playerId);
      placed.push({ player: chosen, x: slot.x });
    }
  }
  return placed;
}

function PlayerDot({ p, index, onRemove, animate = true }: { p: BestXIPlayer; index: number; onRemove?: () => void; animate?: boolean }) {
  const inner = (
    <>
      <div style={{ position: "relative" }}>
        {/* тінь на газоні під гравцем */}
        <div aria-hidden style={{
          position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
          width: 38, height: 10, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)",
          filter: "blur(2px)",
        }} />
        <div style={{
          width: 50, height: 50, borderRadius: "50%", overflow: "hidden", position: "relative",
          border: "2px solid rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.15)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photo} alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        </div>
        <span className="stat-num" style={{
          position: "absolute", top: -6, right: -10,
          background: "#0f6e56", color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "2px 5px", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}>{p.rating.toFixed(2)}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.teamLogo} alt="" style={{
          position: "absolute", bottom: -4, left: -8, width: 18, height: 18,
          objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
        }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </div>
      <span style={{
        fontSize: 10.5, fontWeight: 600, color: "#fff", textAlign: "center",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 84,
        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
      }}>{p.name.split(" ").slice(-1)[0]}</span>
    </>
  );

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.6 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={animate ? { duration: 0.35, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 84 }}
    >
      {onRemove ? (
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          {inner}
        </button>
      ) : (
        <Link href={`/players/${p.playerId}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          {inner}
        </Link>
      )}
    </motion.div>
  );
}

// порожній слот (конструктор)
function EmptySlot({ x, onClick }: { x: number; onClick: () => void }) {
  return (
    <div style={{ position: "absolute", left: `${x * 100}%`, top: 0, transform: "translateX(-50%)" }}>
      <button onClick={onClick} style={{
        width: 50, height: 50, borderRadius: "50%", cursor: "pointer",
        border: "2px dashed rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.08)",
        color: "#fff", fontSize: 24, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
      }}>+</button>
    </div>
  );
}

const SCHEMES = ["4-3-3", "4-4-2", "3-5-2"];

// розкладка слотів за схемою → масив ліній [{slots}]
function schemeLines(formation: string) {
  const f = FORMATIONS[formation];
  return [
    { key: "att", slots: f.att },
    { key: "mid", slots: f.mid },
    { key: "def", slots: f.def },
    { key: "gk", slots: f.gk },
  ];
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative", borderRadius: "var(--r-lg)", overflow: "hidden",
      flex: 1, width: "100%",
      // глибша перспектива — темніше зверху (далечінь), світліше знизу (ближче)
      background: "linear-gradient(180deg, #0f5733 0%, #167a47 45%, #1c8a51 100%)",
      padding: "26px 22px",
      // акцентна рамка в кольорі ліги
      border: "2px solid var(--pat-accent, rgba(255,255,255,0.2))",
      boxShadow: "inset 0 0 90px rgba(0,0,0,0.35), 0 8px 30px rgba(0,0,0,0.25)",
      minHeight: 410,
      display: "flex", flexDirection: "column",
    }}>
      {/* газонні смуги — чергування горизонтальних світлих/темних */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 44px, rgba(0,0,0,0.04) 44px, rgba(0,0,0,0.04) 88px)",
      }} />

      {/* прожектори по кутах — м'які світлі плями */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 8% 6%, rgba(255,255,255,0.18), transparent 28%),
          radial-gradient(circle at 92% 6%, rgba(255,255,255,0.18), transparent 28%),
          radial-gradient(circle at 8% 94%, rgba(255,255,255,0.12), transparent 28%),
          radial-gradient(circle at 92% 94%, rgba(255,255,255,0.12), transparent 28%)
        `,
      }} />

      {/* розмітка поля */}
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "#fff" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 90, height: 90, transform: "translate(-50%,-50%)", border: "2px solid #fff", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 0, left: "50%", width: 180, height: 66, transform: "translateX(-50%)", border: "2px solid #fff", borderBottom: "none", borderRadius: "4px 4px 0 0" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", width: 180, height: 66, transform: "translateX(-50%)", border: "2px solid #fff", borderTop: "none", borderRadius: "0 0 4px 4px" }} />
        {/* малі воротарські */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", width: 90, height: 28, transform: "translateX(-50%)", border: "2px solid #fff", borderBottom: "none" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", width: 90, height: 28, transform: "translateX(-50%)", border: "2px solid #fff", borderTop: "none" }} />
      </div>

      {/* затемнення країв для глибини */}
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

export function LeagueBestXI({ players, pool, showBuilder = true }: { players: BestXIPlayer[]; pool?: BestXIPlayer[]; showBuilder?: boolean }) {
  const reveal = useFirstVisit("bestxi");
  const [formation, setFormation] = useState<string>("4-3-3");
  const [flipped, setFlipped] = useState(false);
  // конструктор: slotKey ("att-0") → гравець
  const [picks, setPicks] = useState<Record<string, BestXIPlayer>>({});
  const [openSlot, setOpenSlot] = useState<{ line: string; i: number; slot: Slot } | null>(null);

  if (players.length < 7) return null;

  // ── авто-збірна (фронт картки) ──
  const f = FORMATIONS[formation];
  // Спільний пул (відсортований за рейтингом) — БЕЗ жорсткого поділу по лініях,
  // щоб фолбеки слотів працювали (напад може взяти AM, фланг — вінгера).
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const used = new Set<number>();
  // Порядок заповнення: воротар → захист → НАПАД → півзахист.
  // Напад раніше за півзахист, щоб забрати ST/AM; вінгери лишаються флангам.
  const autoGk = fillLine(f.gk, sorted, used, "GK");
  const autoDef = fillLine(f.def, sorted, used, "DEF");
  const autoAtt = fillLine(f.att, sorted, used, "ATT");
  const autoMid = fillLine(f.mid, sorted, used, "MID");
  let ai = 0;
  const aAtt = ai; ai += autoAtt.length;
  const aMid = ai; ai += autoMid.length;
  const aDef = ai; ai += autoDef.length;
  const aGk = ai;

  // ── конструктор (зворот) ──
  const usedPickIds = new Set(Object.values(picks).map((p) => p.playerId));
  const lines = schemeLines(formation);

  const handlePick = (p: BestXIPlayer) => {
    if (!openSlot) return;
    setPicks((prev) => ({ ...prev, [`${openSlot.line}-${openSlot.i}`]: p }));
    setOpenSlot(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <p className="section-title" style={{ margin: 0 }}>
          {flipped ? "Збери свою збірну" : "Збірна сезону"}
        </p>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {SCHEMES.map((key) => {
            const active = key === formation;
            return (
              <button key={key} onClick={() => { setFormation(key); setPicks({}); }} style={{
                fontFamily: "var(--font-mono-stack)", fontSize: 12, fontWeight: 600,
                padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                border: "1px solid var(--glass-border)",
                background: active ? "var(--text-1)" : "var(--surface)",
                color: active ? "#fff" : "var(--text-2)", transition: "all 0.2s",
              }}>{key}</button>
            );
          })}
          {/* тоггл перевороту — лише якщо конструктор увімкнено (ліга, не клуб) */}
          {showBuilder && (
            <button onClick={() => setFlipped((v) => !v)} title="Конструктор" style={{
              marginLeft: 4, width: 34, height: 34, borderRadius: 999, cursor: "pointer",
              border: "1px solid var(--glass-border)", background: flipped ? "var(--text-1)" : "var(--surface)",
              color: flipped ? "#fff" : "var(--text-2)", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
            }}>⇄</button>
          )}
        </div>
      </div>

      {/* flip-контейнер */}
      <div style={{ perspective: 1600, position: "relative", flex: 1, display: "flex" }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", transformStyle: "preserve-3d", flex: 1, display: "flex" }}
        >
          {/* ФРОНТ — авто-збірна */}
          <div style={{ backfaceVisibility: "hidden", flex: 1, display: "flex", width: "100%" }}>
            <Field>
              <FieldRow placed={autoAtt} startIndex={aAtt} animate={reveal} />
              <FieldRow placed={autoMid} startIndex={aMid} animate={reveal} />
              <FieldRow placed={autoDef} startIndex={aDef} animate={reveal} />
              <FieldRow placed={autoGk} startIndex={aGk} animate={reveal} />
            </Field>
          </div>

          {/* ЗВОРОТ — конструктор */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", width: "100%" }}>
            <Field>
              {lines.map((ln) => (
                <div key={ln.key} style={{ position: "relative", flex: 1, minHeight: 56 }}>
                  {ln.slots.map((slot, i) => {
                    const key = `${ln.key}-${i}`;
                    const picked = picks[key];
                    if (picked) {
                      return (
                        <div key={key} style={{ position: "absolute", left: `${slot.x * 100}%`, top: 0, transform: "translateX(-50%)" }}>
                          <PlayerDot p={picked} index={0} onRemove={() => setPicks((prev) => {
                            const next = { ...prev }; delete next[key]; return next;
                          })} />
                        </div>
                      );
                    }
                    return <EmptySlot key={key} x={slot.x} onClick={() => setOpenSlot({ line: ln.key, i, slot })} />;
                  })}
                </div>
              ))}
            </Field>
          </div>
        </motion.div>

        {/* модалка пошуку (поверх блоку) */}
        {openSlot && (
          <PlayerSearchModal
            pool={pool ?? []}
            slotRoles={openSlot.slot.roles}
            slotSide={openSlot.slot.side}
            usedIds={usedPickIds}
            onPick={handlePick}
            onClose={() => setOpenSlot(null)}
          />
        )}
      </div>
    </div>
  );
}

function FieldRow({ placed, startIndex, animate }: { placed: Placed[]; startIndex: number; animate: boolean }) {
  return (
    <div style={{ position: "relative", flex: 1, minHeight: 56 }}>
      {placed.map((pl, i) => (
        <div key={pl.player.playerId} style={{ position: "absolute", left: `${pl.x * 100}%`, top: 0, transform: "translateX(-50%)" }}>
          <PlayerDot p={pl.player} index={startIndex + i} animate={animate} />
        </div>
      ))}
    </div>
  );
}
