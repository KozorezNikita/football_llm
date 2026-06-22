/*
  Warnings:

  - You are about to drop the column `accurateLongBallsPctValue` on the `PlayerSeasonStats` table. All the data in the column will be lost.
  - You are about to drop the column `successfulCrossesPctValue` on the `PlayerSeasonStats` table. All the data in the column will be lost.
  - You are about to drop the column `successfulDribblesPctValue` on the `PlayerSeasonStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayerSeasonStats" DROP COLUMN "accurateLongBallsPctValue",
DROP COLUMN "successfulCrossesPctValue",
DROP COLUMN "successfulDribblesPctValue",
ADD COLUMN     "aerialDuelsWonPctValuePct" DOUBLE PRECISION,
ADD COLUMN     "cleanSheetsGk" INTEGER,
ADD COLUMN     "cleanSheetsGkPct" DOUBLE PRECISION,
ADD COLUMN     "crossAccuracy" DOUBLE PRECISION,
ADD COLUMN     "crossAccuracyPct" DOUBLE PRECISION,
ADD COLUMN     "dribbleSuccessRate" DOUBLE PRECISION,
ADD COLUMN     "dribbleSuccessRatePct" DOUBLE PRECISION,
ADD COLUMN     "duelsWonPctValuePct" DOUBLE PRECISION,
ADD COLUMN     "goalsConceded" INTEGER,
ADD COLUMN     "goalsConcededPct" DOUBLE PRECISION,
ADD COLUMN     "goalsConcededPer90" DOUBLE PRECISION,
ADD COLUMN     "goalsPrevented" DOUBLE PRECISION,
ADD COLUMN     "goalsPreventedPct" DOUBLE PRECISION,
ADD COLUMN     "longBallAccuracy" DOUBLE PRECISION,
ADD COLUMN     "longBallAccuracyPct" DOUBLE PRECISION,
ADD COLUMN     "penaltySaves" INTEGER,
ADD COLUMN     "savePercentage" DOUBLE PRECISION,
ADD COLUMN     "savePercentagePct" DOUBLE PRECISION,
ADD COLUMN     "saves" INTEGER,
ADD COLUMN     "savesPct" DOUBLE PRECISION,
ADD COLUMN     "savesPer90" DOUBLE PRECISION;
