"use client";

import { motion } from "framer-motion";

interface Props {
  colors?: [string, string, string];
}

// Атмосферний фон: три м'які кольорові плями, що повільно дрейфують.
// За замовчуванням нейтральні; на сторінці команди — клубні кольори.
export function BlobBackground({ colors }: Props) {
  const [a, b, c] = colors ?? ["#a9c4e8", "#f0b8a8", "#b8e0cf"];
  const blobs = [
    { color: a, size: 460, top: "-12%", left: "-8%", dur: 22 },
    { color: b, size: 420, bottom: "-14%", right: "-6%", dur: 26 },
    { color: c, size: 360, bottom: "8%", left: "42%", dur: 30 },
  ];
  return (
    <div className="bg-blobs" aria-hidden="true">
      {blobs.map((bl, i) => (
        <motion.span
          key={i}
          animate={{
            x: [0, 24, -16, 0],
            y: [0, -18, 14, 0],
          }}
          transition={{ duration: bl.dur, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: bl.color,
            width: bl.size, height: bl.size,
            top: bl.top, left: bl.left, right: bl.right, bottom: bl.bottom,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
