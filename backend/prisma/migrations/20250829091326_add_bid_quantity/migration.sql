/*
  Warnings:

  - You are about to drop the column `quantity` on the `AssetsValue` table. All the data in the column will be lost.
  - Added the required column `askQuantity` to the `AssetsValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bidQuantity` to the `AssetsValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetsValue" DROP COLUMN "quantity",
ADD COLUMN     "askQuantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bidQuantity" DOUBLE PRECISION NOT NULL;
