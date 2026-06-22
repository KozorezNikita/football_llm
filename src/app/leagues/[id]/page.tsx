import { notFound } from "next/navigation";
import { getLeague, getLeagueTopPlayers, getLeagueBestXI, getLeaguePlayerPool } from "@/lib/data/queries";
import { LeagueTable } from "@/components/league/LeagueTable";
import { LeagueShowcase } from "@/components/league/LeagueShowcase";
import { LeagueTopPlayers } from "@/components/league/LeagueTopPlayers";
import { LeagueBestXI } from "@/components/league/LeagueBestXI";
import { PatternTheme } from "@/components/ui/PatternTheme";
import { DelayedReveal } from "@/components/ui/DelayedReveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// читає БД на кожен запит — без статичного пререндеру на білді
export const dynamic = "force-dynamic";

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leagueId = Number(id);
  const [league, topPlayers, bestXI, playerPool] = await Promise.all([
    getLeague(leagueId),
    getLeagueTopPlayers(leagueId),
    getLeagueBestXI(leagueId),
    getLeaguePlayerPool(leagueId),
  ]);
  if (!league || league.teams.length === 0) notFound();

  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 32px 80px", position: "relative" }}>
      <PatternTheme leagueId={league.id} />

      {/* Крихти — лівий верхній кут, на рівні капсули */}
      <div style={{ position: "absolute", top: 40, left: 32, zIndex: 5 }}>
        <Breadcrumbs onDark items={[
          { label: "Ліги", href: "/" },
          { label: league.name, accent: true },
        ]} />
      </div>

      {/* Вітрина команд — на повну ширину */}
      <LeagueShowcase league={league} />

      {/* Блоки з'являються ПІСЛЯ того, як лого долетіли (послідовна зборка) */}
      <DelayedReveal delay={1.9} revealKey={`league-${leagueId}`}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)",
        gap: 24,
        alignItems: "stretch",
      }} className="league-grid">
        {/* Ліва: таблиця (повна, без скролу) — задає висоту рядка */}
        <div className="content-surface">
          <p className="section-title">
            Турнірна таблиця
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-3)", letterSpacing: "0.04em", marginLeft: "auto", fontFamily: "var(--font-mono-stack)" }}>
              {league.season}
            </span>
          </p>
          <LeagueTable teams={league.teams} />
        </div>

        {/* Права: збірна + лідери — розтягується ПОЛЕ, лідери компактні */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
          <div className="content-surface" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <LeagueBestXI players={bestXI} pool={playerPool} />
          </div>
          <div className="content-surface">
            <LeagueTopPlayers data={topPlayers} />
          </div>
        </div>
      </div>
      </DelayedReveal>
    </main>
  );
}
