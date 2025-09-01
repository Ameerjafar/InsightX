/*
  Warnings:

  - You are about to drop the column `leveratgePercent` on the `IndividualAsset` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `IndividualAsset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IndividualAsset" DROP COLUMN "leveratgePercent",
DROP COLUMN "status",
ADD COLUMN     "leveargeBalance" DOUBLE PRECISION,
ADD COLUMN     "leveragePercent" INTEGER,
ADD COLUMN     "leverageValue" DOUBLE PRECISION;
