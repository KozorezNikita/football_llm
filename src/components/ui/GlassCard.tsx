"use client";

import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  hover?: boolean;
  strong?: boolean;
  style?: CSSProperties;
  className?: string;
}

// Скляна картка. Анімація: fade + підйом знизу при появі.
// strong — щільніше скло (для головних карток), hover — інтерактивна.
export function GlassCard({ children, delay = 0, hover = false, strong = false, style, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={className}
      style={{
        background: strong ? "var(--surface-strong)" : "var(--surface)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(var(--blur))",
        WebkitBackdropFilter: "blur(var(--blur))",
        borderRadius: "var(--r-lg)",
        cursor: hover ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
