import type {
  FotMobPlayerResponse,
  FotMobPlayerStatsResponse,
  FotMobTeamResponse,
  FotMobLeagueResponse,
  FotMobSquadMember,
  FotMobStatItem,
} from "./client";
import { METRIC_BY_KEY } from "./metric-map";

// Невпізнані ключі (group::titleId) — для допасування мапи.
export const unknownTitleIds = new Set<string>();

function parseNum(v: string | number | undefined, isFloat: boolean): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  // рядок: чистимо "%", ",", пробіли. "3/5" → беремо перше число (saved penalties)
  const slash = v.indexOf("/");
  const head = slash >= 0 ? v.slice(0, slash) : v;
  const cleaned = head.replace(/[%,\s]/g, "");
  const n = isFloat ? parseFloat(cleaned) : parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

// Метрики гравця: mainLeague.stats (базові: minutes/matches/rating/картки —
// для ВСІХ, у т.ч. воротарів) + firstSeasonStats (topStatCard + statsSection:
// детальні метрики з per90/percentileRank).
export function transformPlayerStats(
  player: FotMobPlayerResponse,
): Record<string, number | null> {
  const out: Record<string, number | null> = {};

  // 1) mainLeague.stats — надійні базові поля (правильна ліга, є minutes завжди)
  const mlStats = player.mainLeague?.stats ?? [];
  for (const s of mlStats) {
    if (!s.localizedTitleId) continue;
    mapStatItem("ml", { localizedTitleId: s.localizedTitleId, statValue: String(s.value ?? ""), title: s.title ?? "" }, out);
  }

  // 2) firstSeasonStats — детальні метрики (per90 + percentileRank)
  const fss = player.firstSeasonStats;
  if (fss) {
    if (fss.topStatCard?.items) {
      for (const item of fss.topStatCard.items) mapStatItem("top", item, out);
    }
    for (const group of fss.statsSection?.items ?? []) {
      const groupKey = group.localizedTitleId ?? "unknown";
      for (const item of group.items ?? []) mapStatItem(groupKey, item, out);
    }
  }

  return out;
}

function mapStatItem(
  groupKey: string,
  item: FotMobStatItem,
  out: Record<string, number | null>,
): void {
  const key = `${groupKey}::${item.localizedTitleId}`;
  const entry = METRIC_BY_KEY.get(key);
  if (!entry) {
    unknownTitleIds.add(key);
    return;
  }

  // value: не перезаписуємо вже встановлене ненульове (mainLeague має пріоритет
  // для базових; statsSection доповнює per90/pct, яких у mainLeague нема)
  const v = parseNum(item.statValue, entry.isFloat);
  if (v != null) out[entry.base] = v;
  if (entry.hasPer90 && item.per90 != null) out[`${entry.base}Per90`] = item.per90;
  if (entry.hasPct && item.percentileRank != null) out[`${entry.base}Pct`] = item.percentileRank;
}

// Метрики ОДНОГО турніру з відповіді playerStats.
// Структура topStatCard + statsSection ідентична firstSeasonStats, тому
// логіка та сама, що в transformPlayerStats — лише інше джерело даних.
// База (minutes/matches/rating/started) приходить з topStatCard (group "top"),
// goals/assists та решта — зі statsSection (shooting/passing/...).
export function transformTournamentStats(
  stats: FotMobPlayerStatsResponse,
): Record<string, number | null> {
  const out: Record<string, number | null> = {};

  if (stats.topStatCard?.items) {
    for (const item of stats.topStatCard.items) mapStatItem("top", item, out);
  }
  for (const group of stats.statsSection?.items ?? []) {
    const groupKey = group.localizedTitleId ?? "unknown";
    for (const item of group.items ?? []) mapStatItem(groupKey, item, out);
  }
  return out;
}

// Профіль гравця → поля Player.
export function transformPlayerProfile(player: FotMobPlayerResponse): {
  id: number;
  name: string;
  birthDate: Date | null;
  primaryPosition: string | null;
  otherPositions: string | null;
  detailedPositions: string | null;
  preferredFoot: string | null;
  photo: string | null;
  teamId: number | null;
} {
  const pd = player.positionDescription;

  // FotMob дає готове primaryPosition — використовуємо його (НЕ positions[0],
  // бо positions[] відсортований за розташуванням на полі, не за головною).
  const primary = pd?.primaryPosition?.label ?? null;

  // решта позицій: спершу офіційні nonPrimaryPositions, інакше — з positions[]
  // (де isMainPosition=false), за спаданням occurences.
  let otherLabels: string[] = [];
  if (pd?.nonPrimaryPositions?.length) {
    otherLabels = pd.nonPrimaryPositions
      .map((p) => p.label)
      .filter((x): x is string => !!x);
  } else {
    otherLabels = (pd?.positions ?? [])
      .filter((p) => !p.isMainPosition)
      .map((p) => p.strPos?.label)
      .filter((x): x is string => !!x);
  }

  const allLabels = primary ? [primary, ...otherLabels] : otherLabels;

  let birthDate: Date | null = null;
  if (player.birthDate?.utcTime) {
    const d = new Date(player.birthDate.utcTime);
    if (!Number.isNaN(d.getTime())) birthDate = d;
  }

  const info = (player as Record<string, unknown>).playerInformation as
    | { value?: { fallback?: string }; title?: string }[]
    | undefined;
  let preferredFoot: string | null = null;
  if (Array.isArray(info)) {
    const footEntry = info.find((x) => x.title?.toLowerCase().includes("foot"));
    preferredFoot = footEntry?.value?.fallback ?? null;
  }

  return {
    id: player.id,
    name: player.name,
    birthDate,
    primaryPosition: primary,
    otherPositions: otherLabels.join(",") || null,
    detailedPositions: allLabels.join(",") || null,
    preferredFoot,
    photo: `https://images.fotmob.com/image_resources/playerimages/${player.id}.png`,
    teamId: player.primaryTeam?.teamId ?? null,
  };
}

export function extractSquad(team: FotMobTeamResponse): FotMobSquadMember[] {
  const groups = team.squad?.squad ?? [];
  const members: FotMobSquadMember[] = [];
  for (const g of groups) {
    if (g.title?.toLowerCase() === "coach") continue;
    for (const m of g.members ?? []) members.push(m);
  }
  return members;
}

export function transformTeam(team: FotMobTeamResponse): {
  id: number;
  name: string;
  country: string | null;
} | null {
  const d = team.details;
  if (!d?.id || !d.name) return null;
  return { id: d.id, name: d.name, country: d.country ?? null };
}

// Дані ліги: профіль (logo за патерном) + країна.
export function transformLeague(league: FotMobLeagueResponse): {
  id: number;
  name: string;
  country: string | null;
  logo: string;
} | null {
  const data = league.table?.[0]?.data;
  const id = data?.leagueId ?? league.details?.id;
  const name = data?.leagueName ?? league.details?.name;
  if (!id || !name) return null;
  return {
    id,
    name,
    country: data?.ccode ?? null,
    logo: `https://images.fotmob.com/image_resources/logo/leaguelogo/${id}.png`,
  };
}

// Турнірна таблиця → рядки з teamId, назвою, позицією, очками.
// Дає і список команд для ingest, і дані таблиці для фронту.
export function extractTable(league: FotMobLeagueResponse): {
  teamId: number;
  name: string;
  position: number | null;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  points: number | null;
  goalDiff: number | null;
  logo: string;
}[] {
  const rows = league.table?.[0]?.data?.table?.all ?? [];
  return rows.map((r) => ({
    teamId: r.id,
    name: r.name,
    position: r.idx ?? null,
    played: r.played ?? null,
    wins: r.wins ?? null,
    draws: r.draws ?? null,
    losses: r.losses ?? null,
    points: r.pts ?? null,
    goalDiff: r.goalConDiff ?? null,
    logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${r.id}.png`,
  }));
}
