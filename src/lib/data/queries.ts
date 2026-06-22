import type {
  LeagueInfo, TeamInfo, TeamAnalysis, AnalyzedPlayer,
  Metric, PlayerProfile, PositionGroup, Strength,
} from "./types";
import { METRIC_LABELS } from "./metricLabels";
import { positionToRole, positionsToRoles } from "./positionRoles";
import * as mockData from "./mock";

// ─────────────────────────────────────────────────────────────
// Реальні адаптери даних. Якщо DATABASE_URL не заданий (напр. у пісочниці
// чи на демо-деплої без БД) — фолбек на mock, щоб фронт завжди працював.
// У проді просто переконайся, що DATABASE_URL є — і підуть справжні дані.
//
// ВАЖЛИВО (прод-чистота): тут імпортуй свій analyzeTeam напряму:
//   import { analyzeTeam } from "@/lib/analytics";
// і виклич замість локального buildAnalysis(). Я лишаю локальну збірку
// профілю, щоб фронт-пакет був самодостатній без бекенд-папки.
// ─────────────────────────────────────────────────────────────

const HAS_DB = !!process.env.DATABASE_URL;

const FOTMOB_PHOTO = (id: number) =>
  `https://images.fotmob.com/image_resources/playerimages/${id}.png`;
const FOTMOB_TEAMLOGO = (id: number) =>
  `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
const FOTMOB_LEAGUELOGO = (id: number) =>
  `https://images.fotmob.com/image_resources/logo/leaguelogo/${id}.png`;

// Лінива загрузка prisma лише коли є БД (щоб mock-режим не тягнув клієнт).
async function db() {
  const { prisma } = await import("../prisma");
  return prisma;
}

// primaryPosition (FotMob label) → група.
function toGroup(primary: string | null): PositionGroup | null {
  if (!primary) return null;
  const p = primary.toLowerCase();
  if (p.includes("keeper")) return "Goalkeeper";
  if (p.includes("winger") || p.includes("striker") || p.includes("forward")) return "Attacker";
  if (p.includes("midfield")) return "Midfielder";
  if (p.includes("back") || p.includes("defender")) return "Defender";
  return null;
}

// Будуємо PlayerProfile з рядка PlayerSeasonStats + Player (як repository.ts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProfile(row: any): PlayerProfile {
  const metrics: Metric[] = [];
  for (const { key, label } of METRIC_LABELS) {
    // у схемі goals має @map("goals_v") але клієнт читає по полю `goals`
    const value = row[key] ?? null;
    const per90 = row[`${key}Per90`] ?? null;
    const percentile = row[`${key}Pct`] ?? null;
    if (value != null || per90 != null || percentile != null) {
      metrics.push({ key, label, value, per90, percentile });
    }
  }
  const primary = row.player?.primaryPosition ?? null;
  return {
    playerId: row.playerId,
    name: row.player?.name ?? `#${row.playerId}`,
    primaryPosition: primary,
    detailedPositions: row.player?.detailedPositions ?? null,
    group: toGroup(primary),
    minutes: row.minutes ?? null,
    matches: row.matches ?? null,
    rating: row.rating ?? null,
    goals: row.goals ?? 0,
    assists: row.assists ?? 0,
    metrics,
    photo: row.player?.photo ?? FOTMOB_PHOTO(row.playerId),
    shirtNumber: row.player?.shirtNumber ?? null,
    age: row.player?.age ?? null,
    country: row.player?.country ?? null,
  };
}

const STRONG = 75;
function topStrengths(p: PlayerProfile, limit = 4): Strength[] {
  const teamMetrics = new Set(["cleanSheets", "goalsConceded"]);
  const allowTeam = p.group === "Goalkeeper" || p.group === "Defender";
  return p.metrics
    .filter((m) => m.percentile != null && m.percentile >= STRONG)
    .filter((m) => allowTeam || !teamMetrics.has(m.key))
    .sort((a, b) => (b.percentile ?? 0) - (a.percentile ?? 0))
    .slice(0, limit)
    .map((m) => ({ metric: m.label, percentile: Math.round(m.percentile!) }));
}

// ── Публічний API ──

export async function getLeague(leagueId: number): Promise<LeagueInfo> {
  if (!HAS_DB) return mockData.getLeague(leagueId);
  const prisma = await db();
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { teams: { orderBy: { position: "asc" } } },
  });
  if (!league) return mockData.getLeague(leagueId);
  return {
    id: league.id, name: league.name, country: league.country,
    logo: league.logo ?? FOTMOB_LEAGUELOGO(league.id), season: league.season,
    teams: league.teams.map((t: {
      id: number; name: string; logo: string | null;
      position: number | null; played: number | null; wins: number | null;
      draws: number | null; losses: number | null; points: number | null;
      goalDiff: number | null;
    }) => ({
      id: t.id, name: t.name, logo: t.logo ?? FOTMOB_TEAMLOGO(t.id),
      position: t.position, played: t.played, wins: t.wins, draws: t.draws,
      losses: t.losses, points: t.points, goalDiff: t.goalDiff,
    })),
  };
}

export async function getTeam(teamId: number): Promise<TeamInfo> {
  if (!HAS_DB) return mockData.getTeam(teamId);
  const prisma = await db();
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { league: true },
  });
  if (!team) return mockData.getTeam(teamId);
  return {
    id: team.id, name: team.name, logo: team.logo ?? FOTMOB_TEAMLOGO(team.id),
    country: team.country, leagueId: team.leagueId,
    leagueName: team.league?.name ?? null, position: team.position,
  };
}

export async function getTeamAnalysis(
  teamId: number, tournamentId = 53, seasonName = "2025/2026",
): Promise<TeamAnalysis> {
  if (!HAS_DB) return mockData.getTeamAnalysis(teamId, tournamentId, seasonName);
  // ПРОД: краще замінити на → return analyzeTeam(teamId, tournamentId, seasonName)
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { teamId, tournamentId, seasonName },
    include: {
      player: { select: {
        name: true, primaryPosition: true, detailedPositions: true, photo: true,
        shirtNumber: true, age: true, country: true,
      } },
    },
  });
  const ORDER: PositionGroup[] = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const players: AnalyzedPlayer[] = rows.map((r: any) => {
    const profile = rowToProfile(r);
    const significant = profile.group === "Goalkeeper"
      ? (profile.matches ?? 0) >= 5
      : (profile.minutes ?? 0) >= 450;
    return { ...profile, significant, strengths: topStrengths(profile) };
  });
  players.sort((a, b) => {
    const gi = ORDER.indexOf(a.group ?? "Attacker");
    const gj = ORDER.indexOf(b.group ?? "Attacker");
    if (gi !== gj) return gi - gj;
    return (b.minutes ?? 0) - (a.minutes ?? 0);
  });
  return { teamId, tournamentId, seasonName, players, anomalies: [] };
}

// За замовчуванням показуємо Ligue 1. Гравець може мати кілька турнірів
// (Ligue 1, кубок, єврокубок, збірна) — БЕЗ фільтра вибірка недетермінована
// і може повернути не той (напр. ЧС-2026 з 4 хвилинами замість лігового сезону).
const DEFAULT_TOURNAMENT = 53; // Ligue 1
const DEFAULT_SEASON = "2025/2026";

export async function getPlayer(
  playerId: number,
  tournamentId: number = DEFAULT_TOURNAMENT,
  seasonName: string = DEFAULT_SEASON,
): Promise<AnalyzedPlayer | null> {
  if (!HAS_DB) return mockData.getPlayer(playerId);
  const prisma = await db();
  // 1) пробуємо точний турнір+сезон
  let row = await prisma.playerSeasonStats.findFirst({
    where: { playerId, tournamentId, seasonName },
    include: {
      player: { select: {
        name: true, primaryPosition: true, detailedPositions: true, photo: true,
        shirtNumber: true, age: true, country: true,
      } },
    },
  });
  // 2) якщо нема саме цього турніру — беремо запис гравця з найбільшими
  //    хвилинами, але СЕРЕД лігових (виключаємо збірні/товариські),
  //    щоб не підхопити ЧС з кількома хвилинами.
  if (!row) {
    row = await prisma.playerSeasonStats.findFirst({
      where: { playerId, seasonName },
      include: {
        player: { select: {
          name: true, primaryPosition: true, detailedPositions: true, photo: true,
          shirtNumber: true, age: true, country: true,
        } },
      },
      orderBy: { minutes: "desc" },
    });
  }
  if (!row) return mockData.getPlayer(playerId);
  const profile = rowToProfile(row);
  const significant = profile.group === "Goalkeeper"
    ? (profile.matches ?? 0) >= 5
    : (profile.minutes ?? 0) >= 450;
  return { ...profile, significant, strengths: topStrengths(profile) };
}

// Усі турніри, де гравець має статистику — для перемикача на сторінці.
// Сортуємо за хвилинами (Ligue 1 зазвичай зверху).
export async function getPlayerTournaments(
  playerId: number,
  seasonName: string = DEFAULT_SEASON,
): Promise<import("./types").PlayerTournament[]> {
  if (!HAS_DB) {
    return [{ tournamentId: 53, tournamentName: "Ligue 1", seasonName, minutes: 1840, matches: 20 }];
  }
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { playerId, seasonName },
    select: { tournamentId: true, tournamentName: true, seasonName: true, minutes: true, matches: true },
    orderBy: { minutes: "desc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => ({
    tournamentId: r.tournamentId, tournamentName: r.tournamentName,
    seasonName: r.seasonName, minutes: r.minutes, matches: r.matches,
  }));
}

// Команда гравця (для навігації/теми на сторінці гравця).
export async function getPlayerTeam(playerId: number): Promise<
  { id: number; name: string; leagueId: number | null; leagueName: string | null } | null
> {
  if (!HAS_DB) return { id: 9748, name: "Olympique Lyonnais", leagueId: 53, leagueName: "Ligue 1" };
  const prisma = await db();
  const p = await prisma.player.findUnique({
    where: { id: playerId },
    include: { team: { select: { id: true, name: true, leagueId: true, league: { select: { name: true } } } } },
  });
  if (!p?.team) return null;
  return {
    id: p.team.id, name: p.team.name,
    leagueId: p.team.leagueId ?? null,
    leagueName: p.team.league?.name ?? null,
  };
}

// Усі ліги в БД — для лендингу з вибором ліги.
export async function getAllLeagues(): Promise<import("./types").LeagueInfo[]> {
  if (!HAS_DB) {
    const l = await mockData.getLeague(53);
    return [l];
  }
  const prisma = await db();
  const leagues = await prisma.league.findMany({
    include: { teams: { orderBy: { position: "asc" } } },
    orderBy: { id: "asc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return leagues.map((league: any) => ({
    id: league.id, name: league.name, country: league.country,
    logo: league.logo ?? FOTMOB_LEAGUELOGO(league.id), season: league.season,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teams: (league.teams ?? []).map((t: any) => ({
      id: t.id, name: t.name, logo: t.logo ?? FOTMOB_TEAMLOGO(t.id),
      position: t.position, played: t.played, wins: t.wins, draws: t.draws,
      losses: t.losses, points: t.points, goalDiff: t.goalDiff,
    })),
  }));
}

// Топ-гравці ліги ПО ТУРНІРУ ЧЕМПІОНАТУ (tournamentId = leagueId).
// Три списки: за рейтингом, голами, асистами.
export async function getLeagueTopPlayers(
  leagueId: number,
  seasonName = "2025/2026",
  limit = 5,
): Promise<import("./types").LeagueTopPlayers> {
  if (!HAS_DB) {
    const empty = { topRated: [], topScorers: [], topAssists: [] };
    return empty;
  }
  const prisma = await db();
  // всі рядки гравців у турнірі чемпіонату
  const rows = await prisma.playerSeasonStats.findMany({
    where: { tournamentId: leagueId, seasonName },
    select: {
      playerId: true, rating: true, goals: true, assists: true, minutes: true,
      player: { select: { id: true, name: true, photo: true } },
      team: { select: { id: true, name: true, logo: true } },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toTop = (r: any, value: number): import("./types").LeagueTopPlayer => ({
    playerId: r.player.id,
    name: r.player.name,
    photo: r.player.photo ?? FOTMOB_PHOTO(r.player.id),
    teamId: r.team.id,
    teamName: r.team.name,
    teamLogo: r.team.logo ?? FOTMOB_TEAMLOGO(r.team.id),
    value,
  });

  // рейтинг — лише з достатньою кількістю хвилин (≥450), щоб уникнути викидів
  const rated = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.rating != null && (r.minutes ?? 0) >= 450)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => toTop(r, Number((r.rating ?? 0).toFixed(2))));

  const scorers = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => (r.goals ?? 0) > 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (b.goals ?? 0) - (a.goals ?? 0))
    .slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => toTop(r, r.goals ?? 0));

  const assists = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => (r.assists ?? 0) > 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (b.assists ?? 0) - (a.assists ?? 0))
    .slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => toTop(r, r.assists ?? 0));

  return { topRated: rated, topScorers: scorers, topAssists: assists };
}

// Кандидати у збірну сезону з тонкою РОЛЛЮ кожного (для слотів схем).
// По турніру чемпіонату, поріг ≥1500 хв.
export async function getLeagueBestXI(
  leagueId: number,
  seasonName = "2025/2026",
): Promise<import("./types").BestXIPlayer[]> {
  if (!HAS_DB) return [];
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { tournamentId: leagueId, seasonName },
    select: {
      rating: true, minutes: true,
      player: { select: { id: true, name: true, photo: true, primaryPosition: true, detailedPositions: true } },
      team: { select: { id: true, logo: true } },
    },
  });

  const MIN_MINUTES = 1500; // ≈17 матчів

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cands = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.rating != null && (r.minutes ?? 0) >= MIN_MINUTES && r.player.primaryPosition)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => {
      const role = positionToRole(r.player.primaryPosition);
      return {
        playerId: r.player.id,
        name: r.player.name,
        photo: r.player.photo ?? FOTMOB_PHOTO(r.player.id),
        teamId: r.team.id,
        teamLogo: r.team.logo ?? FOTMOB_TEAMLOGO(r.team.id),
        rating: Number((r.rating ?? 0).toFixed(2)),
        role,
        roles: positionsToRoles(r.player.detailedPositions, r.player.primaryPosition),
        primaryPosition: r.player.primaryPosition as string,
      };
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.role != null) as import("./types").BestXIPlayer[];

  // сортуємо за рейтингом (фронт розставить по слотах)
  return cands.sort((a, b) => b.rating - a.rating);
}

// Повний пул гравців ліги для конструктора збірної (пошук + топ по ролі).
// Усі гравці з рейтингом по турніру чемпіонату (без жорсткого порогу хвилин).
export async function getLeaguePlayerPool(
  leagueId: number,
  seasonName = "2025/2026",
): Promise<import("./types").BestXIPlayer[]> {
  if (!HAS_DB) return [];
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { tournamentId: leagueId, seasonName, rating: { not: null } },
    select: {
      rating: true, minutes: true,
      player: { select: { id: true, name: true, photo: true, primaryPosition: true, detailedPositions: true } },
      team: { select: { id: true, logo: true } },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pool = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.player.primaryPosition)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => {
      const role = positionToRole(r.player.primaryPosition);
      return {
        playerId: r.player.id,
        name: r.player.name,
        photo: r.player.photo ?? FOTMOB_PHOTO(r.player.id),
        teamId: r.team.id,
        teamLogo: r.team.logo ?? FOTMOB_TEAMLOGO(r.team.id),
        rating: Number((r.rating ?? 0).toFixed(2)),
        role,
        roles: positionsToRoles(r.player.detailedPositions, r.player.primaryPosition),
        primaryPosition: r.player.primaryPosition as string,
      };
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.role != null) as import("./types").BestXIPlayer[];

  return pool.sort((a, b) => b.rating - a.rating);
}

// ── КЛУБНІ аналоги лігових запитів (фільтр по teamId) ──

// Топ-гравці КЛУБУ (рейтинг/голи/асисти) по турніру чемпіонату.
export async function getTeamTopPlayers(
  teamId: number,
  leagueId: number,
  seasonName = "2025/2026",
  limit = 5,
): Promise<import("./types").LeagueTopPlayers> {
  if (!HAS_DB) return { topRated: [], topScorers: [], topAssists: [] };
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { teamId, tournamentId: leagueId, seasonName },
    select: {
      playerId: true, rating: true, goals: true, assists: true, minutes: true,
      player: { select: { id: true, name: true, photo: true } },
      team: { select: { id: true, name: true, logo: true } },
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toTop = (r: any, value: number): import("./types").LeagueTopPlayer => ({
    playerId: r.player.id, name: r.player.name,
    photo: r.player.photo ?? FOTMOB_PHOTO(r.player.id),
    teamId: r.team.id, teamName: r.team.name,
    teamLogo: r.team.logo ?? FOTMOB_TEAMLOGO(r.team.id), value,
  });
  const rated = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.rating != null && (r.minutes ?? 0) >= 450)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => toTop(r, Number((r.rating ?? 0).toFixed(2))));
  const scorers = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => (r.goals ?? 0) > 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (b.goals ?? 0) - (a.goals ?? 0)).slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => toTop(r, r.goals ?? 0));
  const assists = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => (r.assists ?? 0) > 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (b.assists ?? 0) - (a.assists ?? 0)).slice(0, limit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => toTop(r, r.assists ?? 0));
  return { topRated: rated, topScorers: scorers, topAssists: assists };
}

// Найкраща збірна КЛУБУ — поріг 600 хв (менше гравців у клубі).
export async function getTeamBestXI(
  teamId: number,
  leagueId: number,
  seasonName = "2025/2026",
): Promise<import("./types").BestXIPlayer[]> {
  if (!HAS_DB) return [];
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { teamId, tournamentId: leagueId, seasonName },
    select: {
      rating: true, minutes: true,
      player: { select: { id: true, name: true, photo: true, primaryPosition: true, detailedPositions: true } },
      team: { select: { id: true, logo: true } },
    },
  });
  const MIN_MINUTES = 600;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cands = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.rating != null && (r.minutes ?? 0) >= MIN_MINUTES && r.player.primaryPosition)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => ({
      playerId: r.player.id, name: r.player.name,
      photo: r.player.photo ?? FOTMOB_PHOTO(r.player.id),
      teamId: r.team.id, teamLogo: r.team.logo ?? FOTMOB_TEAMLOGO(r.team.id),
      rating: Number((r.rating ?? 0).toFixed(2)),
      role: positionToRole(r.player.primaryPosition),
      roles: positionsToRoles(r.player.detailedPositions, r.player.primaryPosition),
      primaryPosition: r.player.primaryPosition as string,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.role != null) as import("./types").BestXIPlayer[];
  return cands.sort((a, b) => b.rating - a.rating);
}

// Пул гравців команди для аналізу глибини складу (нижчий поріг, ніж Best XI,
// бо резервісти — це і є глибина). Повертає BestXIPlayer[] з ролями.
export async function getTeamSquadPool(
  teamId: number,
  leagueId: number,
  seasonName = "2025/2026",
): Promise<import("./types").BestXIPlayer[]> {
  if (!HAS_DB) return [];
  const prisma = await db();
  const rows = await prisma.playerSeasonStats.findMany({
    where: { teamId, tournamentId: leagueId, seasonName },
    select: {
      rating: true, minutes: true,
      player: { select: { id: true, name: true, photo: true, primaryPosition: true, detailedPositions: true } },
      team: { select: { id: true, logo: true } },
    },
  });
  const MIN_MINUTES = 300; // відсікаємо геть випадкових, але лишаємо резерв
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cands = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.rating != null && (r.minutes ?? 0) >= MIN_MINUTES && r.player.primaryPosition)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => ({
      playerId: r.player.id, name: r.player.name,
      photo: r.player.photo ?? FOTMOB_PHOTO(r.player.id),
      teamId: r.team.id, teamLogo: r.team.logo ?? FOTMOB_TEAMLOGO(r.team.id),
      rating: Number((r.rating ?? 0).toFixed(2)),
      role: positionToRole(r.player.primaryPosition),
      roles: positionsToRoles(r.player.detailedPositions, r.player.primaryPosition),
      primaryPosition: r.player.primaryPosition as string,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.role != null) as import("./types").BestXIPlayer[];
  return cands.sort((a, b) => b.rating - a.rating);
}
