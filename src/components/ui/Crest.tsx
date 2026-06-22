"use client";

interface Props {
  name: string;
  logo?: string | null;
  size?: number;
  accent?: string;
  viewTransitionName?: string;
}

// Логотип команди. Якщо немає logo — ініціали на склі.
// FotMob-логотипи: images.fotmob.com/image_resources/logo/teamlogo/{id}.png
export function Crest({ name, logo, size = 44, accent, viewTransitionName }: Props) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: "var(--surface-strong)",
      border: "1px solid var(--glass-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden",
    }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name}
          style={{ width: "82%", height: "82%", objectFit: "contain", viewTransitionName }} />
      ) : (
        <span style={{ fontSize: size * 0.32, fontWeight: 500, color: accent ?? "var(--text-2)" }}>
          {initials}
        </span>
      )}
    </div>
  );
}
