-- AlterTable
ALTER TABLE "PlayerSeasonStats" ADD COLUMN     "errorLedToGoal" INTEGER,
ADD COLUMN     "errorLedToGoalPct" DOUBLE PRECISION,
ADD COLUMN     "errorLedToGoalPer90" DOUBLE PRECISION,
ADD COLUMN     "keeperHighClaim" INTEGER,
ADD COLUMN     "keeperHighClaimPct" DOUBLE PRECISION,
ADD COLUMN     "keeperHighClaimPer90" DOUBLE PRECISION,
ADD COLUMN     "keeperSweeper" INTEGER,
ADD COLUMN     "keeperSweeperPct" DOUBLE PRECISION,
ADD COLUMN     "keeperSweeperPer90" DOUBLE PRECISION,
ADD COLUMN     "penaltyGoalsConceded" INTEGER,
ADD COLUMN     "penaltySavePercentage" DOUBLE PRECISION,
ADD COLUMN     "penaltySavePercentagePct" DOUBLE PRECISION;
