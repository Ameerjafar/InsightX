/*
  Warnings:

  - You are about to drop the `AssetsValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AssetsValue";

-- CreateTable
CREATE TABLE "OHLC" (
    "id" SERIAL NOT NULL,
    "crypto" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OHLC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OHLC_crypto_interval_timestamp_key" ON "OHLC"("crypto", "interval", "timestamp");
