// Дзеркало бекенд-типів (src/lib/analytics). Фронт споживає САМЕ цю форму.
// У проді ці типи можна імпортувати напряму з analytics — тут дублюю,
// щоб фронт-пісочниця була самодостатня. Форма 1:1 з analyzeTeam().

export type PositionGroup =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Attacker";

export interface Metric {
  key: string;
  label: string;
  value: number | null;
  per90: number | null;
  percentile: number | null; // 0–100
}

export interface Strength {
  metric: string;
  percentile: number;
}

export interface PlayerProfile {
  playerId: number;
  name: string;
  primaryPosition: string | null;
  detailedPositions?: string | null;
  group: PositionGroup | null;
  minutes: number | null;
  matches: number | null;
  rating: number | null;
  goals: number;
  assists: number;
  metrics: Metric[];
  // поля для фронту (є в Player, додаємо у вибірку):
  photo?: string | null;
  shirtNumber?: number | null;
  age?: number | null;
  country?: string | null;
}

export interface AnalyzedPlayer extends PlayerProfile {
  significant: boolean;
  strengths: Strength[];
}

export interface Anomaly {
  playerId: number;
  playerName: string;
  kind: "elite" | "concern" | "unusual";
  note: string;
}

export interface TeamAnalysis {
  teamId: number;
  tournamentId: number;
  seasonName: string;
  players: AnalyzedPlayer[];
  anomalies: Anomaly[];
}

// ── Сутності навігації ──

export interface TeamRow {
  id: number;
  name: string;
  logo: string | null;
  position: number | null;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  points: number | null;
  goalDiff: number | null;
}

export interface LeagueInfo {
  id: number;
  name: string;
  country: string | null;
  logo: string | null;
  season: string | null;
  teams: TeamRow[];
}

export interface TeamInfo {
  id: number;
  name: string;
  logo: string | null;
  country: string | null;
  leagueId: number | null;
  leagueName: string | null;
  position: number | null;
}

// Турнір, у якому гравець має статистику (для перемикача на сторінці гравця).
export interface PlayerTournament {
  tournamentId: number;
  tournamentName: string;
  seasonName: string;
  minutes: number | null;
  matches: number | null;
}

// Топ-гравець ліги (для блоку рейтинг/бомбардири/асистенти).
export interface LeagueTopPlayer {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  value: number; // рейтинг / голи / асисти залежно від категорії
}

export interface LeagueTopPlayers {
  topRated: LeagueTopPlayer[];
  topScorers: LeagueTopPlayer[];
  topAssists: LeagueTopPlayer[];
}

// Гравець збірної сезону (на полі).
export interface BestXIPlayer {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamLogo: string;
  rating: number;
  role: import("./positionRoles").Role;
  roles: import("./positionRoles").Role[];
  primaryPosition: string;
}


