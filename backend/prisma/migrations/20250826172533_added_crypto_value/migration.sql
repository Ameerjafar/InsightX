/*
  Warnings:

  - Added the required column `cryptoValue` to the `IndividualAsset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndividualAsset" ADD COLUMN     "cryptoValue" INTEGER NOT NULL;
