/*
  Warnings:

  - You are about to drop the column `leveargeBalance` on the `IndividualAsset` table. All the data in the column will be lost.
  - You are about to drop the column `leverageValue` on the `IndividualAsset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IndividualAsset" DROP COLUMN "leveargeBalance",
DROP COLUMN "leverageValue",
ALTER COLUMN "cryptoValue" SET DATA TYPE DOUBLE PRECISION;
