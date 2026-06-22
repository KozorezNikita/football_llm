import {
  isSignificant,
  type PlayerProfile,
  type PositionGroup,
} from "./metrics";
import {
  topStrengths,
  detectAnomalies,
  type Strength,
  type Anomaly,
} from "./insights";
import { getTeamProfiles } from "./repository";

export interface AnalyzedPlayer extends PlayerProfile {
  significant: boolean;
  strengths: Strength[];
}

export interface TeamAnalysis {
  teamId: number;
  tournamentId: number;
  seasonName: string;
  players: AnalyzedPlayer[];
  anomalies: Anomaly[];
}

const GROUP_ORDER: PositionGroup[] = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Attacker",
];

// Повний аналіз команди на даних FotMob (перцентилі готові).
export async function analyzeTeam(
  teamId: number,
  tournamentId: number,
  seasonName: string,
): Promise<TeamAnalysis> {
  const profiles = await getTeamProfiles(teamId, tournamentId, seasonName);

  const players: AnalyzedPlayer[] = profiles.map((p) => ({
    ...p,
    significant: isSignificant(p),
    strengths: topStrengths(p),
  }));

  // сортування: група, потім хвилини/матчі
  players.sort((a, b) => {
    const gi = GROUP_ORDER.indexOf(a.group ?? "Attacker");
    const gj = GROUP_ORDER.indexOf(b.group ?? "Attacker");
    if (gi !== gj) return gi - gj;
    return (b.minutes ?? 0) - (a.minutes ?? 0);
  });

  // аномалії лише по значущих гравцях
  const anomalies = detectAnomalies(players.filter((p) => p.significant));

  return { teamId, tournamentId, seasonName, players, anomalies };
}

export type { PlayerProfile, Strength, Anomaly };
