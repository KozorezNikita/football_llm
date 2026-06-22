import { notFound } from "next/navigation";
import { getTeam, getTeamAnalysis, getTeamTopPlayers, getTeamBestXI, getTeamSquadPool } from "@/lib/data/queries";
import { analyzeSquad, squadHash } from "@/lib/data/squadAnalysis";
import { prisma } from "@/lib/prisma";
import { PatternTheme } from "@/components/ui/PatternTheme";
import { DelayedReveal } from "@/components/ui/DelayedReveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClubThemeProvider } from "@/components/team/ClubThemeProvider";
import { TeamSquadFlip } from "@/components/team/TeamSquadFlip";
import { TeamLeaderCards } from "@/components/team/TeamLeaderCards";
import { SquadNeeds } from "@/components/team/SquadNeeds";
import { LeagueBestXI } from "@/components/league/LeagueBestXI";
import { LeagueTopPlayers } from "@/components/league/LeagueTopPlayers";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teamId = Number(id);

  const team = await getTeam(teamId);
  if (!team) notFound();

  const leagueId = team.leagueId ?? 53;
  const [analysis, topPlayers, bestXI, squadPool] = await Promise.all([
    getTeamAnalysis(teamId, leagueId),
    getTeamTopPlayers(teamId, leagueId),
    getTeamBestXI(teamId, leagueId),
    getTeamSquadPool(teamId, leagueId),
  ]);

  const squadReport = analyzeSquad(squadPool);

  // збережений ШІ-звіт: показуємо одразу, якщо склад не змінився (хеш збігся)
  const hash = squadHash(squadReport);
  const saved = await prisma.team.findUnique({
    where: { id: teamId },
    select: { scoutReport: true, scoutReportHash: true },
  });
  const initialScoutReport = saved?.scoutReport && saved.scoutReportHash === hash
    ? saved.scoutReport
    : null;


  return (
    <ClubThemeProvider teamId={teamId}>
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 32px 80px", position: "relative" }}>
        <PatternTheme leagueId={team.leagueId ?? null} />

        {/* Крихти — лівий верхній кут */}
        <div style={{ position: "absolute", top: 40, left: 32, zIndex: 5 }}>
          <Breadcrumbs onDark items={[
            { label: "Ліги", href: "/" },
            { label: team.leagueName ?? "Ліга", href: team.leagueId ? `/leagues/${team.leagueId}` : "/" },
            { label: team.name, accent: true },
          ]} />
        </div>

        {/* Шапка клубу — лого зліва, справа текст + картки під ним */}
        <div className="content-surface-mid" style={{ marginTop: 44, marginBottom: 24, display: "flex", gap: 28, alignItems: "stretch" }}>
          {/* лого — квадрат на всю висоту блоку */}
          <div style={{
            flexShrink: 0, aspectRatio: "1", borderRadius: "var(--r-lg)",
            background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            alignSelf: "stretch", minWidth: 160,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={team.logo} alt={team.name}
              style={{ width: "62%", height: "62%", objectFit: "contain", viewTransitionName: `team-logo-${teamId}` }} />
          </div>

          {/* права частина: текст зверху, картки знизу */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <p className="eyebrow" style={{ margin: "0 0 6px" }}>
              {team.leagueName} · {team.position}-те місце
            </p>
            <h1 className="display" style={{ fontSize: 48, margin: "0 0 20px", color: "var(--text-1)", textTransform: "uppercase", lineHeight: 0.95 }}>
              {team.name}
            </h1>
            <div style={{ marginTop: "auto" }}>
              <TeamLeaderCards data={topPlayers} />
            </div>
          </div>
        </div>

        {/* Дві колонки: склад | (збірна + лідери) */}
        <DelayedReveal delay={0.15} revealKey={`team-${teamId}`}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)",
          gap: 24,
          alignItems: "stretch",
        }} className="league-grid">
          {/* Ліва: склад */}
          <div className="content-surface">
            <TeamSquadFlip players={analysis.players} />
          </div>

          {/* Права: збірна клубу + лідери клубу */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
            <div className="content-surface" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <LeagueBestXI players={bestXI} showBuilder={false} />
            </div>
            <div className="content-surface">
              <LeagueTopPlayers data={topPlayers} />
            </div>
          </div>
        </div>

        {/* Аналіз складу — слабкі зони + ШІ-вердикт (один блок) */}
        <div className="content-surface" style={{ marginTop: 24 }}>
          <SquadNeeds report={squadReport} teamId={teamId} initialReport={initialScoutReport} />
        </div>
        </DelayedReveal>
      </main>
    </ClubThemeProvider>
  );
}
