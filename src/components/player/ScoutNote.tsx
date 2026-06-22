"use client";

import { motion } from "framer-motion";

// Блок скаут-нотатки. У проді текст приходить з lib/llm/scout.
// Тут — м'яка fade-поява абзаців по черзі (стримана альтернатива typewriter).
export function ScoutNote({ text }: { text: string }) {
  const paragraphs = text.split("\n").filter((p) => p.trim());
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--glass-border)",
      backdropFilter: "blur(var(--blur))",
      WebkitBackdropFilter: "blur(var(--blur))",
      borderRadius: "var(--r-lg)",
      padding: "20px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{
          width: 6, height: 6, borderRadius: 999, background: "var(--pat-accent, var(--club-accent))",
        }} />
        <span style={{
          fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          Скаут-нотатка
        </span>
      </div>
      {paragraphs.map((p, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 * i }}
          style={{
            fontSize: 14.5, lineHeight: 1.7, color: "var(--text-2)",
            margin: i === 0 ? 0 : "12px 0 0",
          }}
        >
          {p}
        </motion.p>
      ))}
    </div>
  );
}
