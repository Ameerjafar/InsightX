/*
  Warnings:

  - You are about to drop the column `Price` on the `AssetsValue` table. All the data in the column will be lost.
  - Added the required column `buyPrice` to the `AssetsValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellPrice` to the `AssetsValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetsValue" DROP COLUMN "Price",
ADD COLUMN     "buyPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellPrice" DOUBLE PRECISION NOT NULL;
