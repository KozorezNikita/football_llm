import { analyzeTeam } from "../analytics";
import { generate } from "./anthropic";
import { buildContext, buildSystemPrompt, type Lang } from "./prompt";

export interface ScoutNote {
  teamId: number;
  teamName: string;
  seasonName: string;
  lang: Lang;
  note: string;
  usage: { inputTokens: number; outputTokens: number };
}

// Генерує скаутську замітку: analyzeTeam (FotMob числа) → context → LLM.
export async function generateScoutNote(opts: {
  teamId: number;
  teamName: string;
  tournamentId: number;
  seasonName: string;
  lang: Lang;
}): Promise<ScoutNote> {
  const { teamId, teamName, tournamentId, seasonName, lang } = opts;

  const analysis = await analyzeTeam(teamId, tournamentId, seasonName);
  const context = buildContext(analysis, teamName);
  const system = buildSystemPrompt(lang);

  const result = await generate({ system, user: context, maxTokens: 1500 });

  return {
    teamId,
    teamName,
    seasonName,
    lang,
    note: result.text,
    usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
  };
}
