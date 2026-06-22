import { prisma } from "../prisma";
import {
  toGroup,
  METRIC_LABELS,
  type PlayerProfile,
  type Metric,
} from "./metrics";

// Будуємо PlayerProfile з рядка PlayerSeasonStats + Player.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProfile(row: any): PlayerProfile {
  const metrics: Metric[] = [];
  for (const { key, label } of METRIC_LABELS) {
    const value = row[key] ?? null;
    const per90 = row[`${key}Per90`] ?? null;
    const percentile = row[`${key}Pct`] ?? null;
    // включаємо метрику, лише якщо є хоч якесь значення
    if (value != null || per90 != null || percentile != null) {
      metrics.push({ key, label, value, per90, percentile });
    }
  }

  const primary = row.player?.primaryPosition ?? null;

  return {
    playerId: row.playerId,
    name: row.player?.name ?? `#${row.playerId}`,
    primaryPosition: primary,
    group: toGroup(primary),
    minutes: row.minutes ?? null,
    matches: row.matches ?? null,
    rating: row.rating ?? null,
    goals: row.goals ?? 0,
    assists: row.assists ?? 0,
    metrics,
  };
}

const INCLUDE = {
  player: { select: { name: true, primaryPosition: true, detailedPositions: true } },
} as const;

// Гравці команди за турнір+сезон.
export async function getTeamProfiles(
  teamId: number,
  tournamentId: number,
  seasonName: string,
): Promise<PlayerProfile[]> {
  const rows = await prisma.playerSeasonStats.findMany({
    where: { teamId, tournamentId, seasonName },
    include: INCLUDE,
  });
  return rows.map(toProfile);
}
