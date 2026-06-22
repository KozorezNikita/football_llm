import type { BestXIPlayer } from "./types";
import { FORMATIONS, type Slot, type Role } from "./positionRoles";

// ── Математичний аналіз складу команди (БЕЗ ШІ/токенів) ──
// 1) визначає основну формацію (найвищий сумарний рейтинг XI),
// 2) по кожному слоту рахує стартера + глибину + пріоритет підсилення.

const LINE_ROLES: Record<string, Role[]> = {
  GK: ["GK"],
  DEF: ["CB", "FB", "WB"],
  MID: ["DM", "CM", "AM", "WM"],
  ATT: ["W", "ST"],
};

// людська назва слота за його ролями + боком
const SLOT_LABEL: Record<string, string> = {
  GK: "Воротар",
  CB: "Центральний захисник",
  FB: "Крайній захисник",
  WB: "Латераль",
  DM: "Опорний півзахисник",
  CM: "Центральний півзахисник",
  AM: "Атакувальний півзахисник",
  WM: "Фланговий півзахисник",
  W: "Вінгер",
  ST: "Нападник",
};

function sideWordOf(slot: Slot): string | null {
  return slot.side === "L" ? "left" : slot.side === "R" ? "right" : null;
}

// Заповнює лінію слотів зі спільного пулу (та сама логіка, що Best XI).
interface Placed { slot: Slot; line: string; player: BestXIPlayer | null; }

function fillLine(slots: Slot[], line: string, pool: BestXIPlayer[], used: Set<number>): Placed[] {
  const allowed = LINE_ROLES[line] ?? [];
  const out: Placed[] = [];
  for (const slot of slots) {
    let chosen: BestXIPlayer | null = null;
    const sideWord = sideWordOf(slot);
    for (const role of slot.roles) {
      const sameRole = pool.filter((p) => p.role === role && !used.has(p.playerId));
      if (sameRole.length === 0) continue;
      if (sideWord) {
        const sided = sameRole.find((p) => p.primaryPosition.toLowerCase().includes(sideWord));
        if (sided) { chosen = sided; break; }
      }
      chosen = sameRole[0];
      break;
    }
    if (!chosen) {
      const cand = pool.find((p) => allowed.includes(p.role) && !used.has(p.playerId));
      if (cand) chosen = cand;
    }
    if (chosen) used.add(chosen.playerId);
    out.push({ slot, line, player: chosen });
  }
  return out;
}

function fillFormation(formationKey: string, pool: BestXIPlayer[]): Placed[] {
  const f = FORMATIONS[formationKey];
  if (!f) return [];
  const sorted = [...pool].sort((a, b) => b.rating - a.rating);
  const used = new Set<number>();
  // порядок: воротар → захист → напад → півзахист (як у Best XI)
  return [
    ...fillLine(f.gk, "GK", sorted, used),
    ...fillLine(f.def, "DEF", sorted, used),
    ...fillLine(f.att, "ATT", sorted, used),
    ...fillLine(f.mid, "MID", sorted, used),
  ];
}

// ── Публічні типи результату ──
export type Priority = "high" | "medium" | "low";

export interface SlotAnalysis {
  line: string;           // GK/DEF/MID/ATT
  x: number;              // позиція на полі (0-1)
  side?: "L" | "R";
  label: string;          // людська назва
  role: Role;             // основна роль слота
  starter: BestXIPlayer | null;
  starterRating: number | null;
  depth: number;          // скільки АДЕКВАТНИХ альтернатив (≥ DEPTH_RATING)
  alternatives: BestXIPlayer[];
  priority: Priority;
}

export interface SquadReport {
  formation: string;
  slots: SlotAnalysis[];
  // зведення для зручності/ШІ
  highPriority: SlotAnalysis[];
  strongZones: SlotAnalysis[];
}

const DEPTH_RATING = 6.7;   // поріг «адекватного» гравця для глибини
const WEAK_STARTER = 6.85;  // нижче цього стартер вважається слабким

// Скільки гравців пулу можуть зіграти роль (за всіма ролями), окрім стартера.
function countDepth(role: Role, starterId: number | null, pool: BestXIPlayer[]): BestXIPlayer[] {
  return pool
    .filter((p) => p.playerId !== starterId)
    .filter((p) => (p.roles ?? [p.role]).includes(role))
    .filter((p) => p.rating >= DEPTH_RATING)
    .sort((a, b) => b.rating - a.rating);
}

function priorityOf(starterRating: number | null, depth: number): Priority {
  if (starterRating == null) return "high";          // взагалі нема гравця
  const weakStarter = starterRating < WEAK_STARTER;
  if (weakStarter && depth === 0) return "high";     // слабкий і без заміни
  if (weakStarter || depth === 0) return "medium";   // одне з двох
  return "low";                                       // міцний + є глибина
}

// Вибір основної формації: та, де сумарний рейтинг XI найвищий.
export function pickFormation(pool: BestXIPlayer[]): string {
  let best = "4-3-3";
  let bestScore = -1;
  for (const key of Object.keys(FORMATIONS)) {
    const placed = fillFormation(key, pool);
    const score = placed.reduce((s, p) => s + (p.player?.rating ?? 0), 0);
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return best;
}

export function analyzeSquad(pool: BestXIPlayer[]): SquadReport {
  const formation = pickFormation(pool);
  const placed = fillFormation(formation, pool);

  const slots: SlotAnalysis[] = placed.map((p) => {
    const role = (p.slot.roles[0] ?? p.player?.role ?? "CM") as Role;
    const starter = p.player;
    const alternatives = countDepth(role, starter?.playerId ?? null, pool);
    const depth = alternatives.length;
    const starterRating = starter?.rating ?? null;
    return {
      line: p.line,
      x: p.slot.x,
      side: p.slot.side,
      label: SLOT_LABEL[role] ?? role,
      role,
      starter,
      starterRating,
      depth,
      alternatives: alternatives.slice(0, 3),
      priority: priorityOf(starterRating, depth),
    };
  });

  const highPriority = slots.filter((s) => s.priority === "high");
  const strongZones = slots
    .filter((s) => s.priority === "low" && (s.starterRating ?? 0) >= 7.1)
    .sort((a, b) => (b.starterRating ?? 0) - (a.starterRating ?? 0));

  return { formation, slots, highPriority, strongZones };
}

// Відбиток складу — щоб розуміти, чи змінився склад після збереження звіту.
// Простий стабільний хеш від ролей+гравців+рейтингів у слотах.
export function squadHash(report: SquadReport): string {
  const sig = report.formation + "|" + report.slots
    .map((s) => `${s.role}:${s.starter?.playerId ?? 0}:${s.starterRating ?? 0}:${s.depth}`)
    .join(",");
  let h = 0;
  for (let i = 0; i < sig.length; i++) {
    h = (Math.imul(31, h) + sig.charCodeAt(i)) | 0;
  }
  return String(h >>> 0);
}

// ── Структурований опис складу для ШІ (вхід у модель) ──
export function squadToPromptData(teamName: string, report: SquadReport): string {
  const line = (s: SlotAnalysis) =>
    `- ${s.label}${s.side === "L" ? " (лівий)" : s.side === "R" ? " (правий)" : ""}: ` +
    `${s.starter?.name ?? "немає гравця"} ${s.starterRating?.toFixed(2) ?? "—"}, ` +
    `глибина ${s.depth}` +
    (s.alternatives.length ? ` (заміни: ${s.alternatives.map((a) => `${a.name} ${a.rating.toFixed(2)}`).join(", ")})` : "") +
    ` — пріоритет ${s.priority}`;

  return [
    `Команда: ${teamName}`,
    `Основна формація: ${report.formation}`,
    ``,
    `Склад по слотах (стартер / рейтинг / глибина / пріоритет):`,
    ...report.slots.map(line),
  ].join("\n");
}
