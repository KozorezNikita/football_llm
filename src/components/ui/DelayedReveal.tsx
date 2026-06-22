"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";

// Проявляє вміст із затримкою — але ЛИШЕ при першому візиті сторінки в сесії.
// При поверненні (навігація назад) рендерить одразу, щоб морфінг мав куди
// приземлити елемент (фото/лого), а не летів у ще-не-змонтований блок.
export function DelayedReveal({
  delay = 0,
  revealKey,
  children,
}: {
  delay?: number;
  revealKey: string;
  children: ReactNode;
}) {
  const first = useFirstVisit(`reveal:${revealKey}`);

  if (!first) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
