"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "idle" | "loading" | "typing" | "done" | "error";

export function ScoutReport({ teamId, initialReport }: { teamId: number; initialReport?: string | null }) {
  const [phase, setPhase] = useState<Phase>(initialReport ? "done" : "idle");
  const [shown, setShown] = useState(initialReport ?? "");
  const [cached, setCached] = useState(!!initialReport);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // друк по словах (швидко, чисто на фронті)
  function startTyping(text: string, instant = false) {
    if (instant) { setShown(text); setPhase("done"); return; }
    const words = text.split(/(\s+)/); // зберігаємо пробіли
    let i = 0;
    setShown("");
    setPhase("typing");
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = setInterval(() => {
      i += 1;
      setShown(words.slice(0, i).join(""));
      if (i >= words.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        setPhase("done");
      }
    }, 28);
  }

  async function generate(force = false) {
    setPhase("loading");
    try {
      const res = await fetch("/api/scout-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId, force }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setCached(!!data.cached);
      // кешований — показуємо одразу; свіжий — друкуємо
      startTyping(data.text, data.cached);
    } catch {
      setPhase("error");
    }
  }

  const paragraphs = shown.split("\n").filter((p) => p.trim());

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 460 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: phase === "idle" ? 0 : 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p className="section-title" style={{ margin: 0 }}>Вердикт скаута</p>
          <span style={{ fontSize: 11, color: "var(--text-3)", border: "1px solid var(--glass-border)", borderRadius: 999, padding: "2px 8px" }}>ШІ</span>
        </div>
        {phase === "done" && (
          <button onClick={() => generate(true)} style={{
            fontSize: 12, color: "var(--text-3)", background: "none", border: "none",
            cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3,
          }}>
            Перегенерувати
          </button>
        )}
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: (phase === "idle" || phase === "loading" || phase === "error") ? "center" : "flex-start",
      }}>
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "32px 20px", textAlign: "center" }}
          >
            <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0, maxWidth: 440 }}>
              ШІ проаналізує склад: сильний кістяк, зони ризику та куди логічно
              спрямувати підсилення.
            </p>
            <button onClick={() => generate(false)} style={{
              padding: "11px 22px", borderRadius: 999, cursor: "pointer",
              background: "var(--pat-accent, var(--club-accent))", color: "#fff",
              border: "none", fontSize: 14, fontWeight: 600,
            }}>
              Згенерувати звіт скаута
            </button>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "32px 20px", color: "var(--text-3)", fontSize: 14 }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, border: "2px solid var(--glass-border)", borderTopColor: "var(--pat-accent, var(--club-accent))", borderRadius: "50%", display: "inline-block" }}
            />
            Аналізую склад…
          </motion.div>
        )}

        {(phase === "typing" || phase === "done") && (
          <motion.div key="text"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--text-2)", margin: 0 }}>
                  {p}
                  {phase === "typing" && i === paragraphs.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ display: "inline-block", width: 7, height: 16, background: "var(--pat-accent, var(--club-accent))", marginLeft: 2, verticalAlign: "text-bottom" }}
                    />
                  )}
                </p>
              ))}
            </div>
            {phase === "done" && cached && (
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 12 }}>
                Збережений звіт · оновіть, якщо склад змінився
              </p>
            )}
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 20px", textAlign: "center" }}
          >
            <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>Не вдалося згенерувати звіт.</p>
            <button onClick={() => generate(false)} style={{
              padding: "9px 18px", borderRadius: 999, cursor: "pointer",
              background: "var(--surface-strong)", color: "var(--text-1)",
              border: "1px solid var(--glass-border)", fontSize: 13, fontWeight: 600,
            }}>
              Спробувати ще раз
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
