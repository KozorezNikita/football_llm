import type { AnalyzedPlayer } from "./types";

// Складає скаут-нотатку ПРОГРАМНО з даних аналітики (перцентилі, сильні/слабкі
// сторони). НЕ використовує LLM — жодних токенів. Дані ті самі, що дає
// `npm run analyze`: метрики з перцентилями + обчислені сильні сторони.

const POS_LABEL: Record<string, string> = {
  Goalkeeper: "воротар",
  Defender: "захисник",
  Midfielder: "півзахисник",
  Attacker: "нападник",
};

// командні/позиційні метрики, що не релевантні польовим / атакувальним
const TEAM_METRICS = new Set([
  "cleanSheets", "cleanSheetsGk", "goalsConceded", "goalsConcededOnPitch",
  "xgConceded", "xgConcededOnPitch", "saves",
]);

function topPctLabel(percentile: number): string {
  const top = Math.max(1, 100 - percentile); // 100-й перцентиль → "топ-1%", не "0%"
  return `топ-${top}% ліги`;
}

export function buildScoutNote(player: AnalyzedPlayer): string {
  const lines: string[] = [];
  const pos = player.group ? POS_LABEL[player.group] ?? "гравець" : "гравець";
  const allowTeam = player.group === "Goalkeeper" || player.group === "Defender";

  // 1) загальний рядок — рейтинг + позиція
  if (player.rating != null) {
    lines.push(
      `${player.name} — ${pos} із середнім рейтингом ${player.rating.toFixed(2)} ` +
      `за сезон (${player.matches ?? 0} матчів, ${player.goals} голів, ${player.assists} асистів).`,
    );
  } else {
    lines.push(`${player.name} — ${pos}.`);
  }

  // 2) сильні сторони — з обчислених strengths (топ-перцентилі)
  const top = (player.strengths ?? []).slice(0, 4);
  if (top.length > 0) {
    const items = top.map((s) => `${s.metric.toLowerCase()} (${topPctLabel(s.percentile)})`);
    lines.push(`Сильні сторони: ${items.join(", ")}.`);
  }

  // 3) зони росту — найнижчі перцентилі, БЕЗ нерелевантних командних метрик
  const weak = (player.metrics ?? [])
    .filter((m) => m.percentile != null && m.percentile <= 30)
    .filter((m) => allowTeam || !TEAM_METRICS.has(m.key))
    .sort((a, b) => (a.percentile ?? 100) - (b.percentile ?? 100))
    .slice(0, 3);
  if (weak.length > 0) {
    const items = weak.map((m) => m.label.toLowerCase());
    lines.push(`Зони росту: ${items.join(", ")} — нижче за середнє по лізі.`);
  }

  return lines.join("\n");
}
