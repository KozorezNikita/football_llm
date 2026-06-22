import { generate } from "./anthropic";
import { buildSquadReportContext, buildSquadReportSystem } from "./squadReportPrompt";
import type { SquadReport } from "../data/squadAnalysis";

export interface SquadReportResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
}

// Генерує текстовий вердикт по складу (широкий формат). Математика — на вході.
export async function generateSquadReport(
  report: SquadReport,
  teamName: string,
): Promise<SquadReportResult> {
  const system = buildSquadReportSystem();
  const user = buildSquadReportContext(report, teamName);
  const result = await generate({ system, user, maxTokens: 700 });
  return {
    text: result.text,
    usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens },
  };
}
