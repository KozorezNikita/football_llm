// Кольорове кодування перцентиля за СИЛОЮ (рішення Віктора).
// Зелений = топ, через жовтий/помаранчевий, до червоного = слабко.
// Це універсальна шкала, незалежна від клубного кольору.
// Клубний колір живе в blob-фоні / лінії радара / активних станах.

export interface PctColor {
  bar: string; // колір заповнення бару
  text: string; // колір числа-перцентиля (трохи темніший для контрасту)
  track: string; // колір доріжки під баром (нейтральний)
}

// Світла тема: насичені, але не кислотні відтінки.
export function percentileColor(pct: number | null): PctColor {
  const track = "rgba(20,30,45,0.08)";
  if (pct == null) {
    return { bar: "#c4ccd6", text: "#8a94a3", track };
  }
  if (pct >= 80) return { bar: "#1d9e75", text: "#0f6e56", track }; // елітно
  if (pct >= 60) return { bar: "#5aa830", text: "#3b6d11", track }; // сильно
  if (pct >= 40) return { bar: "#e0a020", text: "#8a5a08", track }; // середньо
  if (pct >= 20) return { bar: "#e07a35", text: "#9e4a1d", track }; // слабко
  return { bar: "#dd4b4b", text: "#a32d2d", track }; // дуже слабко
}

// Текстова мітка сили (для тултіпів / a11y).
export function percentileLabel(pct: number | null): string {
  if (pct == null) return "немає даних";
  if (pct >= 80) return "елітний";
  if (pct >= 60) return "сильний";
  if (pct >= 40) return "середній";
  if (pct >= 20) return "нижче середнього";
  return "слабкий";
}

// Українські назви позиційних груп.
export function groupLabel(g: string | null): string {
  switch (g) {
    case "Goalkeeper": return "Воротар";
    case "Defender": return "Захисник";
    case "Midfielder": return "Півзахисник";
    case "Attacker": return "Нападник";
    default: return "—";
  }
}

// Скорочення групи для бейджів.
export function groupShort(g: string | null): string {
  switch (g) {
    case "Goalkeeper": return "GK";
    case "Defender": return "DEF";
    case "Midfielder": return "MID";
    case "Attacker": return "ATT";
    default: return "—";
  }
}
