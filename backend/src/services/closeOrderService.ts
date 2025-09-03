import { prisma } from "../lib/prisma.js";

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
  console.log("Processing close order for:", email, asset, quantity);
  
  if (!email || !asset || !quantity) {
    throw new Error("Missing required fields");
  }

  try {
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
    
    const spreadPercentage = 0.01; 
    let adjustedCryptoValue: number;

    if (type === "BUY") {
      adjustedCryptoValue = cryptoValue * (1 - spreadPercentage); 
    } else {
      adjustedCryptoValue = cryptoValue * (1 + spreadPercentage); 
    }
    
    const totalCloseValue = adjustedCryptoValue * quantity;

    let profitLoss: number;
    if (type === "BUY") {
      profitLoss = totalCloseValue - userAsset.cryptoValue;
    } else {
      profitLoss = userAsset.cryptoValue - totalCloseValue;
    }

    const transactionFee = totalCloseValue * 0.001; 
    const netProfitLoss = profitLoss - transactionFee;

    const updatedUSD = userBalance.USD + netProfitLoss;

    const marginToRelease = userAsset.leverageStatus
      ? userAsset.cryptoValue / userAsset.leveragePercent!
      : userAsset.cryptoValue;

    const updatedLockedMargin = Math.max(
      userBalance.lockedMargin - marginToRelease,
      0
    );
    const updatedFreeMargin = updatedUSD - updatedLockedMargin;

    const result = await prisma.$transaction(async (tx) => {
      const balanceUpdate = await tx.balance.updateMany({
        where: { userId: user.id },
        data: {
          USD: updatedUSD,
          freeMargin: updatedFreeMargin,
          lockedMargin: updatedLockedMargin,
        },
      });
      console.log(balanceUpdate);

      await tx.individualAsset.delete({
        where: { id: individualAssetId },
      });

      return await tx.balance.findUnique({
        where: { id: userBalance.id },
      });
    });

    return {
      message: "Order closed successfully",
      profitLoss: netProfitLoss,
      balance: result,
      spreadApplied: spreadPercentage * 100 + "%",
      adjustedPrice: adjustedCryptoValue,
      originalPrice: cryptoValue,
    };

  } catch (error) {
    console.error("Failed to close order:", error);
    throw error;
  }
};

