"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { percentileColor } from "@/lib/data/percentile";
import type { Strength } from "@/lib/data/types";

// Герой-блок: 3-4 головні якості гравця великими плашками.
// Перетворює "список барів" на миттєвий портрет — чим гравець особливий.
// "топ X%" виводимо з перцентиля: pct 96 → топ 4%.

function topLabel(pct: number): string {
  const top = Math.max(1, Math.round(100 - pct));
  if (pct >= 99) return "топ 1% ліги";
  return `топ ${top}% ліги`;
}

export function StrengthHighlights({ strengths, hideTitle = false }: { strengths: Strength[]; hideTitle?: boolean }) {
  const items = strengths.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <div>
      {!hideTitle && (
      <motion.p
        className="eyebrow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{ margin: "0 0 12px" }}
      >
        Сильні сторони
      </motion.p>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 12,
      }}>
        {items.map((s, i) => {
          const c = percentileColor(s.percentile);
          return (
            <motion.div
              key={s.metric}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="noise"
              style={{
                position: "relative",
                background: "var(--surface-strong)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(var(--blur))",
                WebkitBackdropFilter: "blur(var(--blur))",
                borderRadius: "var(--r-lg)",
                padding: "16px 16px 14px",
                overflow: "hidden",
              }}
            >
              {/* кольорова смужка сили зліва */}
              <span style={{
                position: "absolute", left: 0, top: 12, bottom: 12, width: 3,
                borderRadius: 2, background: c.bar,
              }} />
              <AnimatedNumber
                value={s.percentile}
                duration={1.0}
                className="stat-num"
                style={{
                  fontSize: 34, fontWeight: 700, display: "block",
                  color: c.text, lineHeight: 1, letterSpacing: "-0.02em",
                }}
              />
              <p style={{
                fontSize: 13, fontWeight: 500, color: "var(--text-1)",
                margin: "8px 0 2px", lineHeight: 1.25,
              }}>
                {s.metric}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
                {topLabel(s.percentile)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
