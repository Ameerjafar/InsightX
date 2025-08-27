-- CreateEnum
CREATE TYPE "CryptoCurrency" AS ENUM ('BTC', 'SOL', 'ETH');

-- CreateEnum
CREATE TYPE "CryptoType" AS ENUM ('SELL', 'BUY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "USD" INTEGER NOT NULL DEFAULT 5000,
    "userId" INTEGER NOT NULL,
    "freeMargin" INTEGER NOT NULL,
    "lockedMargin" INTEGER NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndividualAsset" (
    "id" SERIAL NOT NULL,
    "cryptoValue" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "crypto" "CryptoCurrency" NOT NULL,
    "type" "CryptoType" NOT NULL,
    "BalanceId" INTEGER NOT NULL,

    CONSTRAINT "IndividualAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetsValue" (
    "crypto" "CryptoCurrency" NOT NULL DEFAULT 'BTC',
    "Price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetsValue_pkey" PRIMARY KEY ("crypto","timestamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IndividualAsset_BalanceId_key" ON "IndividualAsset"("BalanceId");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualAsset" ADD CONSTRAINT "IndividualAsset_BalanceId_fkey" FOREIGN KEY ("BalanceId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
