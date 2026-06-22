import type {
  LeagueInfo, TeamInfo, TeamAnalysis, AnalyzedPlayer,
  Metric, PositionGroup,
} from "./types";

// ─────────────────────────────────────────────────────────────
// MOCK-ДАНІ. Форма 1:1 з бекендом. У проді замінити нутро адаптерів
// (внизу файлу) на реальні виклики prisma / analyzeTeam.
// ─────────────────────────────────────────────────────────────

const PHOTO = (id: number) =>
  `https://images.fotmob.com/image_resources/playerimages/${id}.png`;

function m(key: string, label: string, value: number, per90: number, pct: number): Metric {
  return { key, label, value, per90, percentile: pct };
}

// Кілька реалістичних гравців Lyon з правдоподібними перцентилями.
function lyonPlayers(): AnalyzedPlayer[] {
  const raw: Array<Partial<AnalyzedPlayer> & {
    playerId: number; name: string; group: PositionGroup;
    primaryPosition: string; metrics: Metric[]; rating: number;
    minutes: number; goals: number; assists: number; shirt: number; age: number;
  }> = [
    {
      playerId: 1364069, name: "Rayan Cherki", group: "Attacker",
      primaryPosition: "Attacking Midfielder", rating: 7.42,
      minutes: 1840, goals: 6, assists: 9, shirt: 18, age: 21,
      metrics: [
        m("xg", "xG", 5.1, 0.31, 88),
        m("npxg", "non-penalty xG", 4.2, 0.26, 84),
        m("xa", "xA", 5.6, 0.34, 94),
        m("chancesCreated", "створені моменти", 52, 2.8, 91),
        m("bigChancesCreated", "явні моменти", 11, 0.6, 96),
        m("successfulDribbles", "вдалий дриблінг", 58, 2.9, 97),
        m("successfulPasses", "точні паси", 980, 49, 72),
        m("passAccuracy", "точність пасів %", 85, 85, 67),
        m("tackles", "відбори", 22, 1.1, 38),
        m("interceptions", "перехоплення", 14, 0.7, 31),
        m("recoveries", "повернення м'яча", 96, 4.8, 52),
      ],
    },
    {
      playerId: 1245678, name: "Alexandre Lacazette", group: "Attacker",
      primaryPosition: "Striker", rating: 7.18,
      minutes: 2100, goals: 14, assists: 4, shirt: 10, age: 34,
      metrics: [
        m("goals", "голи", 14, 0.6, 92),
        m("xg", "xG", 12.8, 0.55, 89),
        m("npxg", "non-penalty xG", 9.6, 0.41, 80),
        m("shots", "удари", 78, 3.3, 85),
        m("shotsOnTarget", "удари у ствір", 34, 1.5, 82),
        m("xa", "xA", 2.9, 0.12, 54),
        m("aerialDuelsWon", "виграні верхові", 48, 2.1, 61),
        m("touches", "торкання", 1420, 61, 44),
      ],
    },
    {
      playerId: 1198877, name: "Maxence Caqueret", group: "Midfielder",
      primaryPosition: "Central Midfielder", rating: 7.05,
      minutes: 2350, goals: 2, assists: 5, shirt: 6, age: 25,
      metrics: [
        m("successfulPasses", "точні паси", 1680, 64, 88),
        m("passAccuracy", "точність пасів %", 91, 91, 86),
        m("chancesCreated", "створені моменти", 38, 1.5, 74),
        m("xa", "xA", 3.4, 0.13, 66),
        m("tackles", "відбори", 64, 2.5, 78),
        m("interceptions", "перехоплення", 41, 1.6, 71),
        m("recoveries", "повернення м'яча", 210, 8.0, 83),
        m("duelsWon", "виграні дуелі", 132, 5.1, 64),
      ],
    },
    {
      playerId: 1156623, name: "Nicolás Tagliafico", group: "Defender",
      primaryPosition: "Left Back", rating: 6.96,
      minutes: 2480, goals: 1, assists: 6, shirt: 3, age: 32,
      metrics: [
        m("xa", "xA", 4.1, 0.15, 91),
        m("chancesCreated", "створені моменти", 44, 1.6, 93),
        m("successfulPasses", "точні паси", 1520, 55, 70),
        m("tackles", "відбори", 72, 2.6, 80),
        m("interceptions", "перехоплення", 48, 1.7, 74),
        m("clearances", "винесення", 88, 3.2, 58),
        m("duelsWon", "виграні дуелі", 168, 6.1, 76),
        m("aerialDuelsWon", "виграні верхові", 52, 1.9, 49),
      ],
    },
    {
      playerId: 1109934, name: "Lucas Perri", group: "Goalkeeper",
      primaryPosition: "Goalkeeper", rating: 6.88,
      minutes: 2880, goals: 0, assists: 0, shirt: 1, age: 27,
      metrics: [
        m("saves", "сейви", 92, 2.9, 72),
        m("savePercentage", "% сейвів", 71, 71, 68),
        m("goalsPrevented", "відвернені голи", 3.2, 0.1, 81),
        m("goalsConceded", "пропущені", 38, 1.2, 55),
        m("cleanSheets", "сухі матчі", 9, 9, 64),
        m("successfulPasses", "точні паси", 980, 30, 58),
      ],
    },
  ];

  return raw.map((p) => {
    const strengths = p.metrics
      .filter((mm) => (mm.percentile ?? 0) >= 75)
      .sort((a, b) => (b.percentile ?? 0) - (a.percentile ?? 0))
      .slice(0, 4)
      .map((mm) => ({ metric: mm.label, percentile: Math.round(mm.percentile!) }));
    return {
      playerId: p.playerId, name: p.name, group: p.group,
      primaryPosition: p.primaryPosition, minutes: p.minutes,
      matches: Math.round((p.minutes ?? 0) / 90), rating: p.rating,
      goals: p.goals, assists: p.assists, metrics: p.metrics,
      photo: PHOTO(p.playerId), shirtNumber: p.shirt, age: p.age,
      country: "France", significant: true, strengths,
    } as AnalyzedPlayer;
  });
}

const LIGUE1: LeagueInfo = {
  id: 53, name: "Ligue 1", country: "France", logo: null, season: "2025/2026",
  teams: [
    { id: 9851, name: "Paris Saint-Germain", logo: null, position: 1, played: 20, wins: 16, draws: 3, losses: 1, points: 51, goalDiff: 38 },
    { id: 9829, name: "Marseille", logo: null, position: 2, played: 20, wins: 13, draws: 4, losses: 3, points: 43, goalDiff: 21 },
    { id: 9853, name: "Monaco", logo: null, position: 3, played: 20, wins: 12, draws: 4, losses: 4, points: 40, goalDiff: 16 },
    { id: 9748, name: "Olympique Lyonnais", logo: null, position: 4, played: 20, wins: 11, draws: 5, losses: 4, points: 38, goalDiff: 14 },
    { id: 9847, name: "Rennes", logo: null, position: 8, played: 20, wins: 8, draws: 5, losses: 7, points: 29, goalDiff: 3 },
    { id: 9831, name: "Lille", logo: null, position: 5, played: 20, wins: 10, draws: 5, losses: 5, points: 35, goalDiff: 10 },
    { id: 10261, name: "Nantes", logo: null, position: 12, played: 20, wins: 6, draws: 6, losses: 8, points: 24, goalDiff: -4 },
    { id: 9876, name: "Toulouse", logo: null, position: 10, played: 20, wins: 7, draws: 6, losses: 7, points: 27, goalDiff: -1 },
  ],
};

// ─────────────────────────────────────────────────────────────
// АДАПТЕРИ — публічний API даних. У проді замінити нутро.
// Сигнатури навмисне async, щоб збігалися з реальними (Prisma).
// ─────────────────────────────────────────────────────────────

export async function getLeague(_leagueId: number): Promise<LeagueInfo> {
  // ПРОД: prisma.league.findUnique({ where:{id}, include:{teams:{orderBy:{position:"asc"}}}})
  return LIGUE1;
}

export async function getTeam(teamId: number): Promise<TeamInfo> {
  // ПРОД: prisma.team.findUnique + league
  const row = LIGUE1.teams.find((t) => t.id === teamId) ?? LIGUE1.teams[3];
  return {
    id: row.id, name: row.name, logo: row.logo, country: "France",
    leagueId: 53, leagueName: "Ligue 1", position: row.position,
  };
}

export async function getTeamAnalysis(
  teamId: number,
  tournamentId = 53,
  seasonName = "2025/2026",
): Promise<TeamAnalysis> {
  // ПРОД: return analyzeTeam(teamId, tournamentId, seasonName)
  const players = lyonPlayers();
  const anomalies = [
    { playerId: 1364069, playerName: "Rayan Cherki", kind: "elite" as const,
      note: "топ-10% ліги серед нападників за «явні моменти» (96-й перцентиль)" },
    { playerId: 1156623, playerName: "Nicolás Tagliafico", kind: "unusual" as const,
      note: "нетиповий креатив для захисника — бере участь у створенні моментів" },
  ];
  return { teamId, tournamentId, seasonName, players, anomalies };
}

export async function getPlayer(playerId: number): Promise<AnalyzedPlayer | null> {
  const players = lyonPlayers();
  return players.find((p) => p.playerId === playerId) ?? null;
}

// Команда гравця (mock) — для getPlayerTeam fallback.
export async function getPlayerTeam(_playerId: number): Promise<{ id: number; name: string } | null> {
  return { id: 9748, name: "Olympique Lyonnais" };
}
