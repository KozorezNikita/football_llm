"use client";

import { motion } from "framer-motion";
import { percentileColor, percentileLabel } from "@/lib/data/percentile";

interface Props {
  label: string;
  percentile: number | null;
  value?: number | null;
  per90?: number | null;
  delay?: number;
}

// Один перцентильний бар. Колір кодує СИЛУ (зелений→червоний).
// Заповнення анімується від 0 до pct% при появі у viewport.
export function PercentileBar({ label, percentile, value, per90, delay = 0 }: Props) {
  const c = percentileColor(percentile);
  const pct = percentile ?? 0;
  const display = per90 != null ? per90.toFixed(2) : value != null ? String(value) : "";

  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 5,
      }}>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
        <span style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          {display && (
            <span className="stat-num" style={{ fontSize: 12, color: "var(--text-3)" }}>{display}</span>
          )}
          <span className="stat-num" style={{ fontSize: 13, fontWeight: 600, color: c.text, minWidth: 22, textAlign: "right" }}>
            {percentile != null ? Math.round(pct) : "—"}
          </span>
        </span>
      </div>
      <div
        role="meter"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentileLabel(percentile)}`}
        style={{
          height: 7, background: c.track, borderRadius: 999, overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
          style={{ height: "100%", background: c.bar, borderRadius: 999 }}
        />
      </div>
    </div>
  );
}
