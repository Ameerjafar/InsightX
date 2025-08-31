/*
  Warnings:

  - Added the required column `stopLoss` to the `IndividualAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `takeProfit` to the `IndividualAsset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndividualAsset" ADD COLUMN     "stopLoss" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "takeProfit" DOUBLE PRECISION NOT NULL;
