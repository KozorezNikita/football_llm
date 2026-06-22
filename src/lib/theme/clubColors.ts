// Клубна тематизація. Кожна команда має primary/secondary/accent (hex).
// Колір застосовується як АКЦЕНТ (blur-blobs, активні стани, лінія радара),
// база й текст лишаються нейтральними — щоб продукт був цілісним.
//
// Поки що — захардкоджена мапа (Ligue 1). Пізніше: node-vibrant з логотипу
// + ручний override. У проді ці поля живуть у моделі Team (colorPrimary тощо).

export interface ClubTheme {
  primary: string;
  secondary: string;
  accent: string;
}

// Дефолт для команд без явної теми (нейтральний синьо-сірий).
export const DEFAULT_THEME: ClubTheme = {
  primary: "#4a6fa5",
  secondary: "#7a8aa0",
  accent: "#5b8def",
};

// Ligue 1 — стартовий набір. Підбираю кольори, що читаються на світлому glass:
// насичені, але не чорні (чорний на світлому фоні дає брудну пляму через blur).
export const CLUB_COLORS: Record<number, ClubTheme> = {
  9748: { primary: "#d7263d", secondary: "#1f5fc4", accent: "#e63950" }, // Lyon — червоний/синій
  9847: { primary: "#c8102e", secondary: "#2b2b2b", accent: "#d81e3f" }, // Rennes — червоний/чорний
  // ── Premier League ──
  9825: { primary: "#ef0107", secondary: "#063672", accent: "#ef0107" }, // Arsenal — червоний/синій
  8456: { primary: "#6caee0", secondary: "#1c2c5b", accent: "#6caee0" }, // Man City — блакитний
  10260: { primary: "#da291c", secondary: "#fbe122", accent: "#da291c" }, // Man United — червоний
  8650: { primary: "#c8102e", secondary: "#00b2a9", accent: "#c8102e" }, // Liverpool — червоний
  8455: { primary: "#034694", secondary: "#dba111", accent: "#034694" }, // Chelsea — синій
  8586: { primary: "#132257", secondary: "#ffffff", accent: "#3a5bbf" }, // Tottenham — темно-синій
  10252: { primary: "#95bfe5", secondary: "#670e36", accent: "#670e36" }, // Aston Villa — бордо/блакит
  8668: { primary: "#003399", secondary: "#ffffff", accent: "#2b57c4" }, // Everton — синій
  9817: { primary: "#000000", secondary: "#ffffff", accent: "#555555" }, // Newcastle — чорно-білий
  9829: { primary: "#004170", secondary: "#d4a017", accent: "#1565a8" }, // Marseille — синій/золото
  9851: { primary: "#0a1f44", secondary: "#e30613", accent: "#1c3a6e" }, // PSG — темно-синій/червоний
  9831: { primary: "#e30613", secondary: "#000000", accent: "#e8424f" }, // Lille (приклад)
  10261: { primary: "#0067b1", secondary: "#fdb913", accent: "#2b86cf" }, // Nantes (приклад)
  9837: { primary: "#008d36", secondary: "#ffffff", accent: "#22a34e" }, // Saint-Étienne (приклад зелений)
  9876: { primary: "#67001d", secondary: "#b8860b", accent: "#8a1232" }, // Toulouse (приклад)
  9853: { primary: "#cf142b", secondary: "#1d3c8b", accent: "#dd2e44" }, // Monaco (приклад)
};

export function getClubTheme(teamId: number | null | undefined): ClubTheme {
  if (teamId == null) return DEFAULT_THEME;
  return CLUB_COLORS[teamId] ?? DEFAULT_THEME;
}

// ── Контраст: гарантуємо, що клубний колір видно на світлому фоні ──
// Дуже світлі клубні кольори (білий/жовтий) на frosted-white провалюються.
// Якщо колір замало темний — затемнюємо, щоб лишився акцентом.

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Відносна яскравість (0 = чорний, 1 = білий).
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Зсуваємо яскравість: amount<0 темніше, >0 світліше.
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  return rgbToHex(
    r + (t - r) * p,
    g + (t - g) * p,
    b + (t - b) * p,
  );
}

// Колір, безпечний як акцент на СВІТЛОМУ фоні: якщо надто світлий — темнимо.
export function safeAccentOnLight(hex: string): string {
  const lum = luminance(hex);
  if (lum > 0.7) return shade(hex, -0.45); // дуже світлий → суттєво темніше
  if (lum > 0.55) return shade(hex, -0.25);
  return hex;
}

// Колір, безпечний на ТЕМНОМУ фоні: якщо надто темний — світлимо.
export function safeAccentOnDark(hex: string): string {
  const lum = luminance(hex);
  if (lum < 0.18) return shade(hex, 0.4); // майже чорний → світліше
  if (lum < 0.3) return shade(hex, 0.2);
  return hex;
}
