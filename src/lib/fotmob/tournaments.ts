// З statSeasons гравця обираємо турніри для інжесту.
// Кожен турнір → запит playerStats з його entryId (= seasonId) + прапор
// isFirstSeason (true лише якщо турнір у НАЙПЕРШОМУ сезоні списку statSeasons).

import type { FotMobPlayerResponse } from "./client";

export interface TournamentRequest {
  seasonId: string;       // entryId, напр. "1-0"
  tournamentId: number;   // 53 = Ligue 1
  tournamentName: string; // "Ligue 1"
  seasonName: string;     // "2025/2026"
  isFirstSeason: boolean;
  hasDeepStats: boolean;
}

// Турніри гравця для інжесту (лише hasDeepStats=true — інакше playerStats порожній).
// targetSeason: фільтр сезону (напр. "2025/2026"), щоб не тягнути всю кар'єру.
// onlyTournamentIds: якщо заданий — лише ці турніри (напр. [53] для Ligue 1).
export function selectTournaments(
  player: FotMobPlayerResponse,
  opts: { targetSeason?: string; onlyTournamentIds?: number[] } = {},
): TournamentRequest[] {
  const seasons = player.statSeasons ?? [];
  const out: TournamentRequest[] = [];

  seasons.forEach((season, seasonIdx) => {
    const isFirstSeason = seasonIdx === 0;
    if (opts.targetSeason && season.seasonName !== opts.targetSeason) return;

    for (const t of season.tournaments ?? []) {
      if (!t.hasDeepStats) continue;
      if (opts.onlyTournamentIds && !opts.onlyTournamentIds.includes(t.tournamentId)) continue;
      out.push({
        seasonId: t.entryId,
        tournamentId: t.tournamentId,
        tournamentName: t.name,
        seasonName: season.seasonName,
        isFirstSeason,
        hasDeepStats: t.hasDeepStats,
      });
    }
  });

  return out;
}
