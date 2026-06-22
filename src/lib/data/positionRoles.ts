// Тонкі позиційні ролі для збірної сезону.
// FotMob дає одну primaryPosition на гравця — мапимо її в роль,
// а слоти схем заповнюємо з пріоритетом: точна роль → фолбек на суміжну.

export type Role =
  | "GK"   // воротар
  | "CB"   // центральний захисник
  | "FB"   // крайній захисник (Left/Right Back)
  | "WB"   // латераль (Wing-Back)
  | "DM"   // опорний півзахисник
  | "CM"   // центральний півзахисник
  | "AM"   // атакувальний півзахисник
  | "WM"   // крайній півзахисник (Left/Right Midfielder)
  | "W"    // вінгер (Left/Right Winger)
  | "ST";  // центрфорвард

// FotMob primaryPosition → роль. Враховано дублі регістру й мови + fallback'и.
export function positionToRole(pos: string | null): Role | null {
  if (!pos) return null;
  const p = pos.trim().toLowerCase();

  if (p.includes("keeper")) return "GK";

  // захист
  if (p.includes("wing-back")) return "WB";
  if (p.includes("left back") || p.includes("right back")) return "FB";
  if (p.includes("center back") || p.includes("centre back")) return "CB";
  if (p === "defender") return "CB"; // загальний fallback

  // півзахист
  if (p.includes("defensive midfield")) return "DM";
  if (p.includes("attacking midfield")) return "AM";
  if (p.includes("left midfield") || p.includes("right midfield")) return "WM";
  if (p.includes("central midfield")) return "CM";
  if (p === "midfielder") return "CM"; // загальний fallback

  // атака
  if (p.includes("winger")) return "W";
  if (p.includes("striker")) return "ST";
  if (p === "forward") return "ST"; // загальний fallback

  return null;
}

// Парсить detailedPositions (рядок "A,B,C") у масив унікальних ролей.
// Дає змогу розрізнити гравців з однаковою primary, але різними вторинними
// (Толіссо AM+DM+CM vs Шульц AM+W+ST).
export function positionsToRoles(detailedPositions: string | null, primaryPosition: string | null): Role[] {
  const parts: string[] = [];
  if (detailedPositions) parts.push(...detailedPositions.split(","));
  if (primaryPosition) parts.push(primaryPosition);
  const roles = new Set<Role>();
  for (const part of parts) {
    const r = positionToRole(part.trim());
    if (r) roles.add(r);
  }
  return [...roles];
}



export function roleLine(role: Role): Line {
  if (role === "GK") return "GK";
  if (role === "CB" || role === "FB" || role === "WB") return "DEF";
  if (role === "DM" || role === "CM" || role === "AM" || role === "WM") return "MID";
  return "ATT"; // W, ST
}

// Слот на полі: яку роль шукати + фолбеки в порядку пріоритету.
export interface Slot {
  // частка по горизонталі (0 = ліворуч, 0.5 = центр, 1 = праворуч)
  x: number;
  roles: Role[]; // перша — ідеальна, далі фолбеки
  side?: "L" | "R"; // для флангових слотів — бік (підбір по primaryPosition)
}

// Схеми: лінії знизу вгору НЕ задаємо тут; задаємо набір ліній зверху вниз
// (ATT, MID, DEF, GK), кожна — масив слотів з координатою x і пріоритетом ролей.
export interface Formation {
  att: Slot[];
  mid: Slot[];
  def: Slot[];
  gk: Slot[];
}

// фолбеки підібрані так, щоб слот заповнився адекватним гравцем,
// якщо точної ролі бракує.
export const FORMATIONS: Record<string, Formation> = {
  "4-3-3": {
    att: [
      { x: 0.16, roles: ["W", "WM", "ST"], side: "L" },  // лівий вінгер
      { x: 0.5, roles: ["ST", "AM", "W"] },               // центрфорвард
      { x: 0.84, roles: ["W", "WM", "ST"], side: "R" },  // правий вінгер
    ],
    mid: [
      { x: 0.25, roles: ["CM", "DM", "AM"] },
      { x: 0.5, roles: ["DM", "CM", "AM"] },              // опорний
      { x: 0.75, roles: ["AM", "CM", "WM"] },             // атак-півзах
    ],
    def: [
      { x: 0.14, roles: ["FB", "WB", "CB"], side: "L" }, // лівий
      { x: 0.38, roles: ["CB", "DM"] },
      { x: 0.62, roles: ["CB", "DM"] },
      { x: 0.86, roles: ["FB", "WB", "CB"], side: "R" }, // правий
    ],
    gk: [{ x: 0.5, roles: ["GK"] }],
  },
  "4-4-2": {
    att: [
      { x: 0.36, roles: ["ST", "W", "AM"] },
      { x: 0.64, roles: ["ST", "W", "AM"] },
    ],
    mid: [
      { x: 0.14, roles: ["WM", "W", "FB"], side: "L" },  // лівий флангу
      { x: 0.38, roles: ["CM", "DM"] },
      { x: 0.62, roles: ["CM", "AM"] },
      { x: 0.86, roles: ["WM", "W", "FB"], side: "R" },  // правий флангу
    ],
    def: [
      { x: 0.14, roles: ["FB", "WB", "CB"], side: "L" },
      { x: 0.38, roles: ["CB", "DM"] },
      { x: 0.62, roles: ["CB", "DM"] },
      { x: 0.86, roles: ["FB", "WB", "CB"], side: "R" },
    ],
    gk: [{ x: 0.5, roles: ["GK"] }],
  },
  "3-5-2": {
    att: [
      { x: 0.36, roles: ["ST", "AM", "W"] },
      { x: 0.64, roles: ["ST", "AM", "W"] },
    ],
    mid: [
      { x: 0.1, roles: ["WB", "FB", "WM", "W"], side: "L" },  // лівий латераль (вінгер у фолбек)
      { x: 0.32, roles: ["CM", "DM", "AM"] },
      { x: 0.5, roles: ["DM", "CM"] },                          // опорний центр
      { x: 0.68, roles: ["CM", "AM"] },
      { x: 0.9, roles: ["WB", "FB", "WM", "W"], side: "R" },  // правий латераль (вінгер у фолбек)
    ],
    def: [
      { x: 0.28, roles: ["CB", "DM"] },
      { x: 0.5, roles: ["CB", "DM"] },
      { x: 0.72, roles: ["CB", "DM"] },
    ],
    gk: [{ x: 0.5, roles: ["GK"] }],
  },
};
