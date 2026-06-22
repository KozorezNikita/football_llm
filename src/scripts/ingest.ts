import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { prisma } from "../lib/prisma";
import { FotMobClient } from "../lib/fotmob/client";
import {
  transformTournamentStats,
  transformPlayerProfile,
  transformTeam,
  transformLeague,
  extractTable,
  extractSquad,
  unknownTitleIds,
} from "../lib/fotmob/transform";
import { selectTournaments } from "../lib/fotmob/tournaments";
import { INGEST_CONFIG } from "../config/ingest";

// FotMob ingest. Запускати ВРУЧНУ (браузер, повільно).
//   npm run ingest
//
// Потік:
//   1. getLeague → дані ліги + таблиця (всі команди з logo/позицією/очками)
//   2. upsert League + усі Team з таблиці
//   3. для кожної команди (всі з таблиці, АБО лише config.teamIds):
//      getTeam → склад → для кожного гравця getPlayer → upsert
//
// config.ingestAllLeagueTeams: true = вся ліга; false = лише config.teamIds.

const {
  leagueId,
  leagueName,
  season,
  teamIds,
  ingestAllLeagueTeams,
  betweenPlayersMs,
  betweenTeamsMs,
  headless,
  navTimeoutMs,
  checkpointFile,
} = INGEST_CONFIG;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadCheckpoint(): Set<number> {
  if (!existsSync(checkpointFile)) return new Set();
  try {
    const raw = JSON.parse(readFileSync(checkpointFile, "utf-8"));
    if (raw.leagueId === leagueId && raw.season === season) {
      return new Set<number>(raw.donePlayerIds ?? []);
    }
    return new Set();
  } catch {
    return new Set();
  }
}

function saveCheckpoint(done: Set<number>) {
  writeFileSync(
    checkpointFile,
    JSON.stringify({ leagueId, season, donePlayerIds: [...done] }, null, 2),
  );
}

async function main() {
  console.log(`\n▶ FotMob ingest · ${leagueName} (${leagueId}) · ${season}`);

  const client = new FotMobClient({ headless, navTimeoutMs });
  await client.init();

  const done = loadCheckpoint();
  if (done.size > 0) console.log(`↻ Checkpoint: ${done.size} гравців оброблено\n`);

  let totalPlayers = 0;

  try {
    // 1) Ліга + таблиця
    console.log(`[ліга] отримую дані Ligue 1 + таблицю...`);
    const leagueResp = await client.getLeague(leagueId, season);
    const leagueData = transformLeague(leagueResp);
    const table = extractTable(leagueResp);

    await prisma.league.upsert({
      where: { id: leagueId },
      create: {
        id: leagueId,
        name: leagueData?.name ?? leagueName,
        country: leagueData?.country ?? null,
        logo: leagueData?.logo ?? null,
        season,
      },
      update: {
        name: leagueData?.name ?? leagueName,
        country: leagueData?.country ?? null,
        logo: leagueData?.logo ?? null,
        season,
      },
    });
    console.log(`  ✓ ліга збережена, команд у таблиці: ${table.length}`);

    // 2) upsert усіх команд з таблиці (logo, позиція, очки)
    // country беремо з ліги — усі команди ліги з однієї країни
    const leagueCountry = leagueData?.country ?? null;
    for (const row of table) {
      await prisma.team.upsert({
        where: { id: row.teamId },
        create: {
          id: row.teamId,
          name: row.name,
          country: leagueCountry,
          logo: row.logo,
          position: row.position,
          played: row.played,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          points: row.points,
          goalDiff: row.goalDiff,
          leagueId,
        },
        update: {
          name: row.name,
          country: leagueCountry,
          logo: row.logo,
          position: row.position,
          played: row.played,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          points: row.points,
          goalDiff: row.goalDiff,
          leagueId,
        },
      });
    }
    console.log(`  ✓ ${table.length} команд збережено\n`);

    // 3) які команди обробляємо повністю (склад + гравці)
    const targetTeamIds = ingestAllLeagueTeams
      ? table.map((t) => t.teamId)
      : teamIds;
    console.log(`Повний ingest гравців для ${targetTeamIds.length} команд\n`);

    for (let t = 0; t < targetTeamIds.length; t++) {
      const teamId = targetTeamIds[t];
      console.log(`[${t + 1}/${targetTeamIds.length}] teamId=${teamId} — склад...`);

      const teamResp = await client.getTeam(teamId);
      const teamData = transformTeam(teamResp);
      if (teamData) {
        await prisma.team.upsert({
          where: { id: teamData.id },
          create: { ...teamData, leagueId },
          update: {
            // country лишаємо з таблиці ліги, якщо getTeam не дав
            ...(teamData.country ? { country: teamData.country } : {}),
            leagueId,
          },
        });
      }

      const squad = extractSquad(teamResp);
      console.log(`  склад: ${squad.length} гравців`);

      for (let i = 0; i < squad.length; i++) {
        const member = squad[i];
        if (done.has(member.id)) continue;

        try {
          const playerResp = await client.getPlayer(member.id);
          const profile = transformPlayerProfile(playerResp);

          await prisma.player.upsert({
            where: { id: profile.id },
            create: {
              id: profile.id,
              name: profile.name,
              birthDate: profile.birthDate,
              age: member.age ?? null,
              height: member.height ?? null,
              shirtNumber: member.shirtNumber ?? null,
              country: member.cname ?? null,
              marketValue: member.transferValue ?? null,
              primaryPosition: profile.primaryPosition,
              otherPositions: profile.otherPositions,
              detailedPositions: profile.detailedPositions ?? member.positionIdsDesc ?? null,
              preferredFoot: profile.preferredFoot,
              photo: profile.photo,
              teamId,
            },
            update: {
              name: profile.name,
              primaryPosition: profile.primaryPosition,
              otherPositions: profile.otherPositions,
              detailedPositions: profile.detailedPositions ?? member.positionIdsDesc ?? null,
              preferredFoot: profile.preferredFoot,
              photo: profile.photo,
              marketValue: member.transferValue ?? null,
              teamId,
            },
          });

          // ── Статистика по турнірах (ВИПРАВЛЕНО: окремий запит на турнір) ──
          // Раніше: transformPlayerStats(playerResp) брав firstSeasonStats =
          // перший сезон зі statSeasons → для збірників це ЧС, не Ligue 1.
          // Тепер: для кожного потрібного турніру окремий playerStats-запит.
          const tournaments = selectTournaments(playerResp, {
            targetSeason: season,
            // ingestTournamentIds у конфігу: напр. [53] лише Ligue 1 (тест),
            // або undefined = усі турніри сезону (мультитурнірність на повну).
            onlyTournamentIds: INGEST_CONFIG.ingestTournamentIds,
          });

          if (tournaments.length === 0) {
            // немає deep-stats турнірів цього сезону — пропускаємо стату
            // (профіль гравця вже збережено вище)
            console.log(`    ◌ [${i + 1}/${squad.length}] ${member.name} — немає турнірів з deep stats`);
          } else {
            const statsMap = await client.getPlayerStatsMulti(
              member.id,
              tournaments.map((t) => ({ seasonId: t.seasonId, isFirstSeason: t.isFirstSeason })),
            );

            for (const t of tournaments) {
              const resp = statsMap.get(t.seasonId);
              if (!resp) continue; // запит цього турніру не вдався
              const stats = transformTournamentStats(resp);

              await prisma.playerSeasonStats.upsert({
                where: {
                  playerId_tournamentId_seasonName: {
                    playerId: profile.id,
                    tournamentId: t.tournamentId,
                    seasonName: t.seasonName,
                  },
                },
                create: {
                  playerId: profile.id,
                  teamId,
                  tournamentId: t.tournamentId,
                  tournamentName: t.tournamentName,
                  seasonName: t.seasonName,
                  ...stats,
                },
                update: { teamId, tournamentName: t.tournamentName, ...stats },
              });
            }
            console.log(
              `    ✓ [${i + 1}/${squad.length}] ${member.name} — турнірів: ${tournaments.length}`,
            );
          }

          done.add(member.id);
          saveCheckpoint(done);
          totalPlayers++;
        } catch (e) {
          console.log(`    ⚠ ${member.name}: ${(e as Error).message}`);
        }

        await delay(betweenPlayersMs);
      }

      if (t < targetTeamIds.length - 1) await delay(betweenTeamsMs);
    }
  } finally {
    await client.close();
  }

  if (unknownTitleIds.size > 0) {
    console.log(`\n⚠ Невпізнані метрики (${unknownTitleIds.size}):`);
    for (const id of unknownTitleIds) console.log(`    "${id}"`);
  }

  if (existsSync(checkpointFile)) unlinkSync(checkpointFile);
  console.log(`\n✅ Ingest complete. Гравців: ${totalPlayers}\n`);
}

main()
  .catch((err) => {
    console.error("\n❌ Ingest failed:", err.message ?? err);
    console.error("   (checkpoint збережено — перезапуск продовжить)");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
