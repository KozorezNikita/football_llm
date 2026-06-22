import type { AnalyzedPlayer } from "@/lib/data/types";
import type { RadarAxis } from "@/components/player/Radar";

// 6 осей радара залежно від позиції. Беремо перцентиль потрібних метрик;
// якщо метрики нема — 0. Привид (середній профіль позиції) — статичний орієнтир.

interface RadarConfig {
  axes: { label: string; keys: string[] }[];
  ghost: number[];
}

const CONFIGS: Record<string, RadarConfig> = {
  Attacker: {
    axes: [
      { label: "Дриблінг", keys: ["successfulDribbles"] },
      { label: "Креатив", keys: ["xa", "chancesCreated"] },
      { label: "Фініш", keys: ["goals", "xg"] },
      { label: "Пас", keys: ["passAccuracy", "successfulPasses"] },
      { label: "Оборона", keys: ["tackles", "interceptions"] },
      { label: "Активність", keys: ["touches", "recoveries"] },
    ],
    ghost: [62, 60, 58, 64, 40, 56],
  },
  Midfielder: {
    axes: [
      { label: "Пас", keys: ["passAccuracy", "successfulPasses"] },
      { label: "Креатив", keys: ["xa", "chancesCreated"] },
      { label: "Відбір", keys: ["tackles"] },
      { label: "Перехоп.", keys: ["interceptions"] },
      { label: "Дуелі", keys: ["duelsWon"] },
      { label: "Повернення", keys: ["recoveries"] },
    ],
    ghost: [64, 56, 58, 56, 58, 62],
  },
  Defender: {
    axes: [
      { label: "Відбір", keys: ["tackles"] },
      { label: "Перехоп.", keys: ["interceptions"] },
      { label: "Винесення", keys: ["clearances"] },
      { label: "Верхові", keys: ["aerialDuelsWon"] },
      { label: "Креатив", keys: ["xa", "chancesCreated"] },
      { label: "Пас", keys: ["passAccuracy", "successfulPasses"] },
    ],
    ghost: [62, 60, 58, 60, 38, 58],
  },
  Goalkeeper: {
    axes: [
      { label: "Сейви", keys: ["saves"] },
      { label: "% сейвів", keys: ["savePercentage"] },
      { label: "Відвернені", keys: ["goalsPrevented"] },
      { label: "Сухі", keys: ["cleanSheets"] },
      { label: "Пас", keys: ["successfulPasses"] },
      { label: "Надійність", keys: ["goalsConceded"] },
    ],
    ghost: [58, 56, 54, 56, 52, 54],
  },
};

export function buildRadar(player: AnalyzedPlayer): { axes: RadarAxis[]; ghost: number[] } {
  const cfg = CONFIGS[player.group ?? "Attacker"] ?? CONFIGS.Attacker;
  const pctOf = (keys: string[]): number => {
    const vals = keys
      .map((k) => player.metrics.find((m) => m.key === k)?.percentile)
      .filter((v): v is number => v != null);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };
  const axes = cfg.axes.map((a) => ({ label: a.label, value: pctOf(a.keys) }));
  return { axes, ghost: cfg.ghost };
}
