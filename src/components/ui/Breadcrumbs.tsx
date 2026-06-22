"use client";

import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
  accent?: boolean; // підсвітити клубним кольором
}

export function Breadcrumbs({ items, onDark = false }: { items: Crumb[]; onDark?: boolean }) {
  // На темному патерні — світлі кольори; на світлому фоні — звичайні.
  const linkColor = onDark ? "rgba(255,255,255,0.7)" : "var(--text-2)";
  const lastColor = onDark ? "#fff" : "var(--text-1)";
  const sepColor = onDark ? "rgba(255,255,255,0.45)" : "var(--text-3)";
  const accentColor = onDark ? "#fff" : "var(--club-accent)";

  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      fontSize: 13, marginBottom: 20,
      textShadow: onDark ? "0 1px 6px rgba(0,0,0,0.4)" : "none",
    }}>
      {items.map((c, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: sepColor }}>›</span>}
          {c.href ? (
            <Link
              href={c.href}
              style={{
                color: c.accent ? accentColor : linkColor,
                fontWeight: c.accent ? 600 : 400,
                transition: "opacity 0.2s",
              }}
            >
              {c.label}
            </Link>
          ) : (
            <span style={{ color: c.accent ? accentColor : lastColor, fontWeight: 500 }}>
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
