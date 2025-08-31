import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CloseOrderInput {
  email: string;
  type: "BUY" | "SELL";
  quantity: number;
  asset: string;
  cryptoValue: number;
  individualAssetId: number;
}

export const closeOrderService = async ({
  email,
  type,
  quantity,
  asset,
  cryptoValue,
  individualAssetId,
}: CloseOrderInput) => {
  if (!email || !asset || !quantity) {
    throw new Error("Missing required fields");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const userBalance = await prisma.balance.findFirst({
    where: { userId: user.id },
    include: { assets: true },
  });
  if (!userBalance) throw new Error("User balance not found");

  const userAsset = userBalance.assets.find((a) => a.id === individualAssetId);
  if (!userAsset) throw new Error("No asset to close");

  if (!cryptoValue) throw new Error("Crypto value not available");

  const totalCloseValue = cryptoValue * quantity;

  let profitLoss = 0;
  if (type === "BUY") {
    profitLoss = totalCloseValue - userAsset.cryptoValue;
  } else if (type === "SELL") {
    profitLoss = userAsset.cryptoValue - totalCloseValue;
  }

  const updatedUSD = userBalance.USD + profitLoss;
  const updatedLockedMargin = Math.max(
    userBalance.lockedMargin - userAsset.cryptoValue,
    0
  );
  const updatedFreeMargin = updatedUSD - updatedLockedMargin;

  await prisma.balance.updateMany({
    where: { userId: user.id },
    data: {
      USD: updatedUSD,
      freeMargin: updatedFreeMargin,
      lockedMargin: updatedLockedMargin,
    },
  });

  await prisma.individualAsset.delete({ where: { id: userAsset.id } });

  const updatedBalance = await prisma.balance.findUnique({
    where: { id: userBalance.id },
  });

  return {
    message: "Order closed successfully",
    profitLoss,
    balance: updatedBalance,
  };
};
