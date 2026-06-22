import "dotenv/config";
import { prisma } from "../lib/prisma";
import { analyzeTeam } from "../lib/analytics";
import { INGEST_CONFIG } from "../config/ingest";

// Консольний демо-вивід аналітики на даних FotMob.
//   npm run analyze
// За замовчуванням — Lyon (перший teamId з config).

const TEAM_ID = INGEST_CONFIG.teamIds[0];
const { leagueId, leagueName, season } = INGEST_CONFIG;

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function main() {
  const a = await analyzeTeam(TEAM_ID, leagueId, season);

  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  АНАЛІЗ · teamId=${TEAM_ID} · ${leagueName} · ${season}`);
  console.log(`  Перцентилі — готові від FotMob (повна вибірка ліги)`);
  console.log(`══════════════════════════════════════════════════`);

  let group = "";
  for (const p of a.players) {
    if (!p.significant) continue;
    const g = p.group ?? "—";
    if (g !== group) {
      group = g;
      console.log(`\n┌─ ${g.toUpperCase()} ────────────────────`);
    }
    const mins = p.minutes != null ? `${p.minutes}хв` : `${p.matches ?? 0}м`;
    console.log(
      `│ ${pad(p.name, 22)} ${pad(mins, 8)} рейт:${p.rating ?? "—"} G:${p.goals} A:${p.assists}`,
    );
    if (p.strengths.length > 0) {
      const s = p.strengths.map((x) => `${x.metric} ${x.percentile}%`).join(", ");
      console.log(`│    ↑ ${s}`);
    }
  }

  console.log(`\n\n══════════════════════════════════════════════════`);
  console.log(`  АНОМАЛІЇ ТА ІНСАЙТИ`);
  console.log(`══════════════════════════════════════════════════\n`);
  if (a.anomalies.length === 0) {
    console.log("  (не виявлено)\n");
  } else {
    const byPlayer = new Map<string, typeof a.anomalies>();
    for (const an of a.anomalies) {
      const arr = byPlayer.get(an.playerName) ?? [];
      arr.push(an);
      byPlayer.set(an.playerName, arr);
    }
    for (const [name, list] of byPlayer) {
      console.log(`  ● ${name}`);
      for (const an of list) {
        const mark = an.kind === "elite" ? "✦" : an.kind === "concern" ? "⚠" : "◆";
        console.log(`    ${mark} ${an.note}`);
      }
      console.log("");
    }
  }
}

main()
  .catch((err) => {
    console.error("❌ Analyze failed:", err.message ?? err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
