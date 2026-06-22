import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTeam, getTeamSquadPool } from "@/lib/data/queries";
import { analyzeSquad, squadHash } from "@/lib/data/squadAnalysis";
import { generateSquadReport } from "@/lib/llm/squadReport";

// POST /api/scout-report  { teamId, force? }
// Повертає збережений звіт, якщо склад не змінився; інакше генерує новий.
export async function POST(req: Request) {
  try {
    const { teamId, force } = await req.json();
    if (typeof teamId !== "number") {
      return NextResponse.json({ error: "teamId required" }, { status: 400 });
    }

    const team = await getTeam(teamId);
    if (!team) return NextResponse.json({ error: "team not found" }, { status: 404 });
    const leagueId = team.leagueId ?? 53;

    const pool = await getTeamSquadPool(teamId, leagueId);
    const report = analyzeSquad(pool);
    const hash = squadHash(report);

    // кеш: якщо склад не змінився і не примусово — віддаємо збережений
    const existing = await prisma.team.findUnique({
      where: { id: teamId },
      select: { scoutReport: true, scoutReportHash: true, scoutReportAt: true },
    });
    if (!force && existing?.scoutReport && existing.scoutReportHash === hash) {
      return NextResponse.json({
        text: existing.scoutReport,
        cached: true,
        generatedAt: existing.scoutReportAt,
      });
    }

    // генеруємо новий
    const result = await generateSquadReport(report, team.name);

    await prisma.team.update({
      where: { id: teamId },
      data: {
        scoutReport: result.text,
        scoutReportHash: hash,
        scoutReportAt: new Date(),
      },
    });

    return NextResponse.json({
      text: result.text,
      cached: false,
      usage: result.usage,
    });
  } catch (err) {
    console.error("scout-report error:", err);
    return NextResponse.json({ error: "generation failed" }, { status: 500 });
  }
}
