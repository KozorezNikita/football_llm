"use client";

import { motion } from "framer-motion";

export interface RadarAxis {
  label: string;
  value: number; // 0–100
}

interface Props {
  axes: RadarAxis[];
  ghost?: number[]; // порівняльний профіль (середній по позиції)
  size?: number;
  color?: string;
}

// Кастомний SVG-радар. Основна фігура анімується (scale від центру),
// привид (пунктир) — статичний контур середнього профілю позиції.
export function Radar({ axes, ghost, size = 240, color }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 34;
  const n = axes.length;
  const accent = color ?? "var(--club-accent)";

  const pointAt = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  const polygon = (vals: number[]) =>
    vals.map((v, i) => pointAt(i, (Math.max(0, Math.min(100, v)) / 100) * R).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`Радар: ${axes.map((a) => `${a.label} ${a.value}`).join(", ")}`}>
      {/* сітка */}
      {rings.map((r, i) => (
        <polygon key={i}
          points={axes.map((_, idx) => pointAt(idx, R * r).join(",")).join(" ")}
          fill="none" stroke="rgba(20,30,45,0.1)" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pointAt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(20,30,45,0.1)" strokeWidth={1} />;
      })}

      {/* привид — середній профіль позиції */}
      {ghost && (
        <polygon points={polygon(ghost)} fill="none"
          stroke="rgba(20,30,45,0.35)" strokeWidth={1.5} strokeDasharray="5 4" />
      )}

      {/* основна фігура — анімоване розгортання з центру */}
      <motion.polygon
        points={polygon(axes.map((a) => a.value))}
        fill={accent} fillOpacity={0.22} stroke={accent} strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* вершини */}
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, (a.value / 100) * R);
        return (
          <motion.circle key={i} cx={x} cy={y} r={3} fill="#fff" stroke={accent} strokeWidth={2}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }} />
        );
      })}

      {/* підписи осей */}
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, R + 18);
        return (
          <text key={i} x={x} y={y} fontSize={11} fill="var(--text-2)"
            textAnchor="middle" dominantBaseline="middle">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
