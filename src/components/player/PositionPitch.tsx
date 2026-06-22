"use client";

import { positionToRole, type Role } from "@/lib/data/positionRoles";

// Міні-поле з позиціями гравця: primary (яскрава) + вторинні (тьмяні).
// Координати ролей на полі (x: 0-1 ліво-право, y: 0-1 верх=атака, низ=ворота).
const ROLE_POS: Record<Role, { x: number; y: number; label: string }> = {
  ST: { x: 0.5, y: 0.12, label: "ST" },
  W:  { x: 0.82, y: 0.2, label: "W" },
  AM: { x: 0.5, y: 0.33, label: "AM" },
  WM: { x: 0.85, y: 0.42, label: "WM" },
  CM: { x: 0.5, y: 0.5, label: "CM" },
  DM: { x: 0.5, y: 0.66, label: "DM" },
  WB: { x: 0.85, y: 0.62, label: "WB" },
  FB: { x: 0.82, y: 0.78, label: "FB" },
  CB: { x: 0.5, y: 0.82, label: "CB" },
  GK: { x: 0.5, y: 0.94, label: "GK" },
};

function parseRoles(detailed: string | null | undefined, primary: string | null): { primary: Role | null; others: Role[] } {
  const primaryRole = positionToRole(primary);
  const others = new Set<Role>();
  if (detailed) {
    for (const part of detailed.split(",")) {
      const r = positionToRole(part.trim());
      if (r && r !== primaryRole) others.add(r);
    }
  }
  return { primary: primaryRole, others: [...others] };
}

export function PositionPitch({
  primaryPosition, detailedPositions,
}: { primaryPosition: string | null; detailedPositions?: string | null }) {
  const { primary, others } = parseRoles(detailedPositions, primaryPosition);
  if (!primary && others.length === 0) return null;

  const dot = (role: Role, isPrimary: boolean) => {
    const pos = ROLE_POS[role];
    if (!pos) return null;
    return (
      <div key={role} style={{
        position: "absolute",
        left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 40, height: 40, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono-stack)",
        background: isPrimary ? "var(--pat-accent, #2563eb)" : "rgba(255,255,255,0.85)",
        color: isPrimary ? "#fff" : "#1a2a1f",
        border: isPrimary ? "none" : "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: isPrimary ? 2 : 1,
      }}>
        {pos.label}
      </div>
    );
  };

  return (
    <div>
      <p className="eyebrow" style={{ margin: "0 0 8px" }}>Позиції</p>
      <div style={{
        position: "relative", width: "100%", aspectRatio: "230 / 280",
        borderRadius: "var(--r-md)",
        background: "linear-gradient(180deg, #1a7a4f 0%, #15683f 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        {/* розмітка */}
        <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.2 }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#fff" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 44, height: 44, transform: "translate(-50%,-50%)", border: "1px solid #fff", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", width: 70, height: 26, transform: "translateX(-50%)", border: "1px solid #fff", borderTop: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", width: 70, height: 26, transform: "translateX(-50%)", border: "1px solid #fff", borderBottom: "none" }} />
        </div>
        {others.map((r) => dot(r, false))}
        {primary && dot(primary, true)}
      </div>
    </div>
  );
}
