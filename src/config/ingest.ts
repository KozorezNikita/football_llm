// Константи ingest FotMob. Редагуєш цей файл під потрібну лігу/команди.

export const INGEST_CONFIG = {
  // FotMob ID
  leagueId: 47, // Premier League (Ligue 1 = 53)
  leagueName: "Premier League",
  season: "2025/2026", // ВАЖЛИВО: для АПЛ поточний на FotMob = 2026/2027,
                       // тому сезон тепер ЯВНО передається в getLeague.

  // Команди для ingest (FotMob teamId). Ігнорується якщо ingestAllLeagueTeams=true.
  // teamIds[0] також використовують scout/analyze як ціль за замовчуванням.
  teamIds: [9748] as number[], // Lyon 9748 — дефолт для scout/analyze; для АПЛ-інжесту не важливо

  // true = ingest усіх команд ліги (беруться з турнірної таблиці автоматично);
  // false = лише команди з teamIds вище.
  ingestAllLeagueTeams: true, // вся АПЛ

  // Які турніри тягнути для кожного гравця:
  //   undefined = ВСІ турніри сезону з deep stats (АПЛ + кубки + єврокубки)
  ingestTournamentIds: undefined as number[] | undefined,

  // Затримки (делікатність до FotMob + браузер повільний).
  betweenPlayersMs: 2500,
  betweenTeamsMs: 5000,

  // Playwright
  headless: true,
  navTimeoutMs: 30000,

  // Checkpoint — які гравці вже оброблені.
  checkpointFile: ".ingest-checkpoint.json",
} as const;





//leagueId: 54,           // Bundesliga (перевір в URL!)
//leagueName: "Bundesliga",
//season: "2025/2026",
//ingestAllLeagueTeams: true,