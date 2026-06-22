-- CreateTable
CREATE TABLE "League" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo" TEXT,
    "season" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo" TEXT,
    "leagueId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "country" TEXT,
    "height" INTEGER,
    "preferredFoot" TEXT,
    "shirtNumber" INTEGER,
    "photo" TEXT,
    "primaryPosition" TEXT,
    "otherPositions" TEXT,
    "detailedPositions" TEXT,
    "marketValue" INTEGER,
    "teamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSeasonStats" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "tournamentName" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "minutes" INTEGER,
    "matches" INTEGER,
    "started" INTEGER,
    "rating" DOUBLE PRECISION,
    "goals_v" INTEGER,
    "goalsPer90" DOUBLE PRECISION,
    "goalsPct" DOUBLE PRECISION,
    "xg" DOUBLE PRECISION,
    "xgPer90" DOUBLE PRECISION,
    "xgPct" DOUBLE PRECISION,
    "xgot" DOUBLE PRECISION,
    "xgotPer90" DOUBLE PRECISION,
    "xgotPct" DOUBLE PRECISION,
    "penaltyGoals" INTEGER,
    "penaltyGoalsPer90" DOUBLE PRECISION,
    "penaltyGoalsPct" DOUBLE PRECISION,
    "npxg" DOUBLE PRECISION,
    "npxgPer90" DOUBLE PRECISION,
    "npxgPct" DOUBLE PRECISION,
    "shots" INTEGER,
    "shotsPer90" DOUBLE PRECISION,
    "shotsPct" DOUBLE PRECISION,
    "shotsOnTarget" INTEGER,
    "shotsOnTargetPer90" DOUBLE PRECISION,
    "shotsOnTargetPct" DOUBLE PRECISION,
    "headedShots" INTEGER,
    "headedShotsPer90" DOUBLE PRECISION,
    "headedShotsPct" DOUBLE PRECISION,
    "assists" INTEGER,
    "assistsPer90" DOUBLE PRECISION,
    "assistsPct" DOUBLE PRECISION,
    "xa" DOUBLE PRECISION,
    "xaPer90" DOUBLE PRECISION,
    "xaPct" DOUBLE PRECISION,
    "successfulPasses" INTEGER,
    "successfulPassesPer90" DOUBLE PRECISION,
    "successfulPassesPct" DOUBLE PRECISION,
    "passAccuracy" DOUBLE PRECISION,
    "passAccuracyPct" DOUBLE PRECISION,
    "accurateLongBalls" INTEGER,
    "accurateLongBallsPer90" DOUBLE PRECISION,
    "accurateLongBallsPct" DOUBLE PRECISION,
    "accurateLongBallsPctValue" DOUBLE PRECISION,
    "chancesCreated" INTEGER,
    "chancesCreatedPer90" DOUBLE PRECISION,
    "chancesCreatedPct" DOUBLE PRECISION,
    "bigChancesCreated" INTEGER,
    "bigChancesCreatedPer90" DOUBLE PRECISION,
    "bigChancesCreatedPct" DOUBLE PRECISION,
    "successfulCrosses" INTEGER,
    "successfulCrossesPer90" DOUBLE PRECISION,
    "successfulCrossesPct" DOUBLE PRECISION,
    "successfulCrossesPctValue" DOUBLE PRECISION,
    "successfulDribbles" INTEGER,
    "successfulDribblesPer90" DOUBLE PRECISION,
    "successfulDribblesPct" DOUBLE PRECISION,
    "successfulDribblesPctValue" DOUBLE PRECISION,
    "duelsWon" INTEGER,
    "duelsWonPer90" DOUBLE PRECISION,
    "duelsWonPct" DOUBLE PRECISION,
    "duelsWonPctValue" DOUBLE PRECISION,
    "aerialDuelsWon" INTEGER,
    "aerialDuelsWonPer90" DOUBLE PRECISION,
    "aerialDuelsWonPct" DOUBLE PRECISION,
    "aerialDuelsWonPctValue" DOUBLE PRECISION,
    "touches" INTEGER,
    "touchesPer90" DOUBLE PRECISION,
    "touchesPct" DOUBLE PRECISION,
    "touchesOppBox" INTEGER,
    "touchesOppBoxPer90" DOUBLE PRECISION,
    "touchesOppBoxPct" DOUBLE PRECISION,
    "dispossessed" INTEGER,
    "dispossessedPer90" DOUBLE PRECISION,
    "dispossessedPct" DOUBLE PRECISION,
    "foulsWon" INTEGER,
    "foulsWonPer90" DOUBLE PRECISION,
    "foulsWonPct" DOUBLE PRECISION,
    "penaltiesAwarded" INTEGER,
    "defensiveContributions" INTEGER,
    "defensiveContributionsPer90" DOUBLE PRECISION,
    "defensiveContributionsPct" DOUBLE PRECISION,
    "tackles" INTEGER,
    "tacklesPer90" DOUBLE PRECISION,
    "tacklesPct" DOUBLE PRECISION,
    "interceptions" INTEGER,
    "interceptionsPer90" DOUBLE PRECISION,
    "interceptionsPct" DOUBLE PRECISION,
    "blockedShots" INTEGER,
    "blockedShotsPer90" DOUBLE PRECISION,
    "blockedShotsPct" DOUBLE PRECISION,
    "foulsCommitted" INTEGER,
    "foulsCommittedPer90" DOUBLE PRECISION,
    "foulsCommittedPct" DOUBLE PRECISION,
    "penaltiesConceded" INTEGER,
    "recoveries" INTEGER,
    "recoveriesPer90" DOUBLE PRECISION,
    "recoveriesPct" DOUBLE PRECISION,
    "possessionWonFinalThird" INTEGER,
    "possessionWonFinalThirdPer90" DOUBLE PRECISION,
    "possessionWonFinalThirdPct" DOUBLE PRECISION,
    "dribbledPast" INTEGER,
    "dribbledPastPer90" DOUBLE PRECISION,
    "dribbledPastPct" DOUBLE PRECISION,
    "clearances" INTEGER,
    "clearancesPer90" DOUBLE PRECISION,
    "clearancesPct" DOUBLE PRECISION,
    "cleanSheets" INTEGER,
    "cleanSheetsPct" DOUBLE PRECISION,
    "goalsConcededOnPitch" INTEGER,
    "xgConcededOnPitch" DOUBLE PRECISION,
    "yellowCards" INTEGER,
    "redCards" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerSeasonStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerSeasonStats_teamId_tournamentId_seasonName_idx" ON "PlayerSeasonStats"("teamId", "tournamentId", "seasonName");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSeasonStats_playerId_tournamentId_seasonName_key" ON "PlayerSeasonStats"("playerId", "tournamentId", "seasonName");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeasonStats" ADD CONSTRAINT "PlayerSeasonStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeasonStats" ADD CONSTRAINT "PlayerSeasonStats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
