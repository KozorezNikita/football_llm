import type { PlayerProfile, Metric } from "./metrics";

// Сильні сторони й аномалії на основі ГОТОВИХ перцентилів FotMob.
// Перцентиль FotMob = місце гравця серед своєї позиції в лізі (повна Opta-вибірка).

export interface Strength {
  metric: string; // label
  percentile: number;
}

export interface Anomaly {
  playerId: number;
  playerName: string;
  kind: "elite" | "concern" | "unusual";
  note: string;
}

const ELITE = 90; // топ-10% позиції
const STRONG = 75;
const WEAK = 25;

// Командні/оборонні метрики, доречні лише для воротарів і захисників.
// Для півзахисників/нападників clean sheets — командний шум, не індивідуальна сила.
const DEFENSIVE_TEAM_METRICS = new Set(["cleanSheets", "goalsConceded"]);

function allowsDefensiveTeamMetric(p: PlayerProfile): boolean {
  return p.group === "Goalkeeper" || p.group === "Defender";
}

// Топ-сильні сторони гравця (перцентиль ≥ STRONG), відсортовані.
// Командні оборонні метрики (clean sheets) лишаємо лише воротарям/захисникам.
export function topStrengths(p: PlayerProfile, limit = 4): Strength[] {
  const allowTeam = allowsDefensiveTeamMetric(p);
  return p.metrics
    .filter((m) => m.percentile != null && m.percentile >= STRONG)
    .filter((m) => allowTeam || !DEFENSIVE_TEAM_METRICS.has(m.key))
    .sort((a, b) => (b.percentile ?? 0) - (a.percentile ?? 0))
    .slice(0, limit)
    .map((m) => ({ metric: m.label, percentile: Math.round(m.percentile!) }));
}

function pct(p: PlayerProfile, key: string): number | null {
  return p.metrics.find((m) => m.key === key)?.percentile ?? null;
}

// Аномалії — нетипові профілі, що дають інсайти.
export function detectAnomalies(players: PlayerProfile[]): Anomaly[] {
  const out: Anomaly[] = [];

  for (const p of players) {
    const allowTeam = allowsDefensiveTeamMetric(p);
    // елітні метрики (топ-10%); командні оборонні — лише GK/DEF
    const elite = p.metrics.filter(
      (m) =>
        m.percentile != null &&
        m.percentile >= ELITE &&
        (allowTeam || !DEFENSIVE_TEAM_METRICS.has(m.key)),
    );
    for (const m of elite) {
      out.push({
        playerId: p.playerId,
        playerName: p.name,
        kind: "elite",
        note: `топ-10% ліги серед ${groupUk(p.group)} за «${m.label}» (${Math.round(m.percentile!)}-й перцентиль)`,
      });
    }

    // нападник: багато б'є, погана реалізація (xG високий, голи низькі відносно)
    if (p.group === "Attacker") {
      const xg = pct(p, "xg");
      const goals = pct(p, "goals");
      if (xg != null && goals != null && xg >= STRONG && goals <= WEAK) {
        out.push({
          playerId: p.playerId,
          playerName: p.name,
          kind: "concern",
          note: "створює багато xG, але реалізація нижча за очікувану — недореалізовує моменти",
        });
      }
    }

    // захисник з елітним креативом (xA/створені моменти) — нетиповий профіль
    if (p.group === "Defender") {
      const xa = pct(p, "xa");
      const cc = pct(p, "chancesCreated");
      if ((xa != null && xa >= ELITE) || (cc != null && cc >= ELITE)) {
        out.push({
          playerId: p.playerId,
          playerName: p.name,
          kind: "unusual",
          note: "нетиповий креатив для захисника — бере участь у створенні моментів",
        });
      }
    }
  }

  return out;
}

function groupUk(g: PlayerProfile["group"]): string {
  switch (g) {
    case "Goalkeeper": return "воротарів";
    case "Defender": return "захисників";
    case "Midfielder": return "півзахисників";
    case "Attacker": return "нападників";
    default: return "позиції";
  }
}
