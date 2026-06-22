// Аналітика на даних FotMob. Ключова відмінність від API-Football версії:
// per90 і percentileRank ВЖЕ ПОРАХОВАНІ FotMob (на повній вибірці ліги).
// Тому тут НЕ рахуємо перцентилі — лише читаємо й інтерпретуємо.

// 4 позиційні групи (виводимо з detailedPositions / primaryPosition).
export type PositionGroup =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Attacker";

// Поріг участі. FotMob не дає minutes для воротарів стабільно — для них
// використовуємо matches. Для польових — хвилини.
export const MIN_MINUTES = 450;
export const MIN_MATCHES_GK = 5;

// Одна метрика: значення + per90 + перцентиль (як приходить з FotMob).
export interface Metric {
  key: string; // напр. "xg"
  label: string; // людська назва
  value: number | null;
  per90: number | null;
  percentile: number | null; // 0–100, готовий percentileRank FotMob
}

// Зведений профіль гравця для аналітики.
export interface PlayerProfile {
  playerId: number;
  name: string;
  primaryPosition: string | null;
  group: PositionGroup | null;
  minutes: number | null;
  matches: number | null;
  rating: number | null;
  goals: number;
  assists: number;
  metrics: Metric[]; // усі значущі метрики з перцентилями
}

// Мапінг primaryPosition (FotMob label) → група.
// Лейбли FotMob: "Goalkeeper", "Center Back", "Right/Left Back", "Right/Left Wing-Back",
// "Defensive/Central/Attacking Midfielder", "Right/Left Midfielder",
// "Right/Left Winger", "Striker".
export function toGroup(primary: string | null): PositionGroup | null {
  if (!primary) return null;
  const p = primary.toLowerCase();

  if (p.includes("keeper")) return "Goalkeeper";

  // Нападники: вінгери, страйкери (перевіряємо ДО midfielder, бо "winger" чистий)
  if (p.includes("winger") || p.includes("striker") || p.includes("forward")) {
    return "Attacker";
  }

  // Півзахисники: будь-який midfielder (defensive/central/attacking/right/left)
  if (p.includes("midfield")) return "Midfielder";

  // Захисники: back (center/right/left back, wing-back)
  if (p.includes("back") || p.includes("defender")) return "Defender";

  return null;
}

// Чи гравець має достатньо ігрового часу для аналізу.
export function isSignificant(p: PlayerProfile): boolean {
  if (p.group === "Goalkeeper") {
    return (p.matches ?? 0) >= MIN_MATCHES_GK;
  }
  return (p.minutes ?? 0) >= MIN_MINUTES;
}

// Які метрики показуємо в профілі (читабельні назви + порядок).
// key має збігатися з полем PlayerSeasonStats.
export const METRIC_LABELS: { key: string; label: string }[] = [
  { key: "goals", label: "голи" },
  { key: "xg", label: "xG" },
  { key: "npxg", label: "non-penalty xG" },
  { key: "xgot", label: "xGOT" },
  { key: "shots", label: "удари" },
  { key: "shotsOnTarget", label: "удари у ствір" },
  { key: "assists", label: "асисти" },
  { key: "xa", label: "xA" },
  { key: "chancesCreated", label: "створені моменти" },
  { key: "bigChancesCreated", label: "явні моменти" },
  { key: "successfulPasses", label: "точні паси" },
  { key: "passAccuracy", label: "точність пасів %" },
  { key: "successfulDribbles", label: "вдалий дриблінг" },
  { key: "duelsWon", label: "виграні дуелі" },
  { key: "aerialDuelsWon", label: "виграні верхові" },
  { key: "touches", label: "торкання" },
  { key: "tackles", label: "відбори" },
  { key: "interceptions", label: "перехоплення" },
  { key: "recoveries", label: "повернення м'яча" },
  { key: "clearances", label: "винесення" },
  { key: "defensiveContributions", label: "оборонні дії" },
  { key: "foulsCommitted", label: "фоли" },
  // воротарські
  { key: "saves", label: "сейви" },
  { key: "savePercentage", label: "% сейвів" },
  { key: "goalsConceded", label: "пропущені" },
  { key: "goalsPrevented", label: "відвернені голи" },
  { key: "cleanSheets", label: "сухі матчі" },
];
