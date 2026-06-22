import type { TeamAnalysis, AnalyzedPlayer } from "../analytics";

export type Lang = "uk" | "en";

// Будує компактний контекст для LLM з аналізу команди (FotMob).
// Перцентилі готові від FotMob — подаємо їх як «місце в лізі за позицією».

const GROUP_UK: Record<string, string> = {
  Goalkeeper: "Воротарі",
  Defender: "Захисники",
  Midfielder: "Півзахисники",
  Attacker: "Нападники",
};

function playerLine(p: AnalyzedPlayer): string {
  const mins = p.minutes != null ? `${p.minutes} хв` : `${p.matches ?? 0} матчів`;
  const base = `- ${p.name} (${p.primaryPosition ?? "?"}) | ${mins} | рейтинг ${p.rating ?? "—"} | голи ${p.goals}, асисти ${p.assists}`;
  if (p.strengths.length === 0) return base;
  const s = p.strengths
    .map((x) => `${x.metric} ${x.percentile}-й перцентиль`)
    .join("; ");
  return `${base} | сильні сторони (перцентиль у лізі за позицією): ${s}`;
}

export function buildContext(analysis: TeamAnalysis, teamName: string): string {
  const lines: string[] = [];
  lines.push(`Команда: ${teamName}`);
  lines.push(`Турнір: ${analysis.tournamentId}, сезон: ${analysis.seasonName}`);
  lines.push(
    `Дані FotMob. Перцентилі — місце гравця серед своєї позиції по всій лізі (xG, xA та захисні метрики включно).`,
  );

  const significant = analysis.players.filter((p) => p.significant);
  let group = "";
  for (const p of significant) {
    const g = p.group ?? "—";
    if (g !== group) {
      group = g;
      lines.push(`\n[${GROUP_UK[g] ?? g}]`);
    }
    lines.push(playerLine(p));
  }

  if (analysis.anomalies.length > 0) {
    lines.push(`\n[Аномалії та інсайти]`);
    for (const a of analysis.anomalies) {
      lines.push(`- ${a.playerName}: ${a.note}`);
    }
  }

  return lines.join("\n");
}

export function buildSystemPrompt(lang: Lang): string {
  if (lang === "en") {
    return [
      "You are an experienced football scout and analyst.",
      "You receive a PRE-COMPUTED statistical profile (FotMob data: per-90 metrics, xG/xA, defensive stats, and percentiles within the player's position across the league).",
      "All numbers are already calculated and correct — DO NOT recalculate, invent, or alter any figures, and use only players present in the context (do not add players or facts from your own knowledge).",
      "Write a concise scouting note: (1) standout performers and why, citing specific metrics/percentiles including xG where relevant; (2) notable anomalies; (3) positions needing reinforcement, justified by the data.",
      "Be specific and analytical, flowing prose, not bullet dumps. Max ~400 words.",
      "Percentiles describe standing within the league for that position; low percentile = weak relative to peers.",
    ].join(" ");
  }
  return [
    "Ти досвідчений футбольний скаут і аналітик.",
    "Ти отримуєш ПОПЕРЕДНЬО ПОРАХОВАНИЙ статистичний профіль (дані FotMob: метрики per-90, xG/xA, захисна статистика, перцентилі відносно позиції гравця в лізі).",
    "Усі числа вже пораховані й коректні — НЕ перераховуй, не вигадуй і не змінюй цифр; використовуй ЛИШЕ гравців з контексту (не додавай гравців чи факти з власних знань).",
    "Напиши стислу скаутську замітку: (1) хто проявив себе і чому, з конкретними метриками/перцентилями, включно з xG де доречно; (2) помітні аномалії; (3) позиції, що потребують підсилення, обґрунтовано даними.",
    "Будь конкретним, зв'язний текст, не сухі списки. Максимум ~400 слів.",
    "Перцентиль — місце в лізі для цієї позиції; низький перцентиль = слабкість відносно інших.",
  ].join(" ");
}
