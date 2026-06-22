import { notFound } from "next/navigation";
import { getPlayer, getPlayerTeam, getPlayerTournaments } from "@/lib/data/queries";
import { buildScoutNote } from "@/lib/data/scoutNote";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PatternTheme } from "@/components/ui/PatternTheme";
import { ClubThemeProvider } from "@/components/team/ClubThemeProvider";
import { PlayerCard } from "@/components/player/PlayerCard";

// читає БД на кожен запит — без статичного пререндеру на білді
export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  const playerId = Number(id);

  // Спершу команда — щоб знати лігу гравця (Ligue 1 чи АПЛ).
  const [tournaments, team] = await Promise.all([
    getPlayerTournaments(playerId),
    getPlayerTeam(playerId),
  ]);

  // Дефолтний турнір = ліга команди гравця (53 Ligue 1 / 47 АПЛ),
  // або з URL (?t=), або перший за хвилинами.
  const leagueTournamentId = team?.leagueId ?? null;
  const leagueT = leagueTournamentId
    ? tournaments.find((x) => x.tournamentId === leagueTournamentId)
    : undefined;
  const activeTournamentId = t
    ? Number(t)
    : leagueT?.tournamentId ?? tournaments[0]?.tournamentId ?? leagueTournamentId ?? 53;

  const player = await getPlayer(playerId, activeTournamentId);
  if (!player) notFound();

  const teamId = team?.id ?? 9748;
  const teamName = team?.name ?? "Olympique Lyonnais";

  return (
    <ClubThemeProvider teamId={teamId}>
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 32px 80px", position: "relative" }}>
          <PatternTheme leagueId={team?.leagueId ?? null} />
        <Breadcrumbs onDark items={[
          { label: "Ліги", href: "/" },
          { label: team?.leagueName ?? "Ліга", href: team?.leagueId ? `/leagues/${team.leagueId}` : "/" },
          { label: teamName, href: `/teams/${teamId}`, accent: true },
          { label: player.name },
        ]} />
        <div className="content-surface">
        <PlayerCard
          player={player}
          scoutNote={buildScoutNote(player)}
          tournaments={tournaments}
          activeTournamentId={activeTournamentId}
          playerId={playerId}
        />
        </div>
      </main>
    </ClubThemeProvider>
  );
}
