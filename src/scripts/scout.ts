import "dotenv/config";
import { prisma } from "../lib/prisma";
import { generateScoutNote } from "../lib/llm/scout";
import { INGEST_CONFIG } from "../config/ingest";
import type { Lang } from "../lib/llm/prompt";

// Консольна генерація скаутської замітки (FotMob дані).
//   npm run scout         → українською
//   npm run scout -- en   → англійською

const TEAM_ID = INGEST_CONFIG.teamIds[0];
const { leagueId, season } = INGEST_CONFIG;

async function main() {
  const lang: Lang = process.argv[2] === "en" ? "en" : "uk";

  // назву команди беремо з БД
  const team = await prisma.team.findUnique({ where: { id: TEAM_ID } });
  const teamName = team?.name ?? `team ${TEAM_ID}`;

  console.log(`\n⏳ Генерую замітку (${teamName}, ${season}, ${lang})...\n`);

  const result = await generateScoutNote({
    teamId: TEAM_ID,
    teamName,
    tournamentId: leagueId,
    seasonName: season,
    lang,
  });

  console.log("══════════════════════════════════════════════════");
  console.log(`  СКАУТСЬКА ЗАМІТКА · ${result.teamName} · ${result.seasonName}`);
  console.log("══════════════════════════════════════════════════\n");
  console.log(result.note);
  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`токени: ${result.usage.inputTokens} in / ${result.usage.outputTokens} out`);
  console.log(`──────────────────────────────────────────────────\n`);
}

main()
  .catch((err) => {
    console.error("❌ Scout failed:", err.message ?? err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
