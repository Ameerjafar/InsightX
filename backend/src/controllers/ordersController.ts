import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

interface OpenOrderObject {
  email: string;
  type: "BUY" | "SELL";
  quantity: number;
  asset: string;
  stopLoss?: number;
  takeProfit?: number;
}

interface CloseOrderObject {
  email: string;
  type: "BUY" | "SELL";
  quantity: number;
  asset: string;
}

const prisma = new PrismaClient();

export const openOrder = async (req: Request, res: Response) => {
  const { email, type, quantity, asset }: OpenOrderObject = req.body;

  if (!email || !asset || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userBalance = await prisma.balance.findFirst({
      where: { userId: user.id },
    });
    if (!userBalance)
      return res.status(404).json({ message: "User balance not found" });

    const cryptoValue = Number(process.env[asset]);
    if (!cryptoValue)
      return res.status(500).json({ message: "Crypto value not available" });

    const totalCost = cryptoValue * quantity;
    if (userBalance.freeMargin < totalCost) {
      return res
        .status(403)
        .json({ message: "Insufficient free margin to buy" });
    }

    await prisma.balance.update({
      where: { id: userBalance.id },
      data: {
        // USD: userBalance.USD - totalCost,
        freeMargin: userBalance.freeMargin - totalCost,
        lockedMargin: userBalance.lockedMargin + totalCost,
      },
    });
    const order = await prisma.individualAsset.create({
      data: {
        BalanceId: userBalance.id,
        cryptoValue: totalCost,
        type,
        quantity: 1,
        crypto: asset as any,
      },
    });

    return res
      .status(200)
      .json({ message: "Buy order placed successfully", order });
    // } else {
    //   if (userBalance.freeMargin < totalCost) {
    //     return res.status(403).json({ message: "Insufficient free margin to sell" });
    //   }

    //   // if (!existingAsset || existingAsset.cryptoValue < totalCost) {
    //   //   return res.status(403).json({ message: "Not enough asset to sell" });
    //   // }

    //   await prisma.balance.update({
    //     where: { id: userBalance.id },
    //     data: {
    //       // USD: userBalance.USD - (userBalance.USD - (cryptoValue * quantity)),
    //       freeMargin: userBalance.freeMargin - totalCost,
    //       lockedMargin: userBalance.lockedMargin + totalCost,
    //     },
    //   });

    //   const order = await prisma.individualAsset.create({
    //     data: {
    //       BalanceId: userBalance.id,
    //       cryptoValue: totalCost,
    //       type: "SELL",
    //       crypto: asset as any,
    //     },
    //   });

    return res
      .status(200)
      .json({ message: "Sell order placed successfully", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error placing order", error });
  }
};

export const closeOrder = async (req: Request, res: Response) => {
  const { email, type, quantity, asset }: CloseOrderObject = req.body;

  if (!email || !asset || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userBalance = await prisma.balance.findFirst({
      where: { userId: user.id },
      include: { asset: true },
    });
    if (!userBalance)
      return res.status(404).json({ message: "User balance not found" });

    const userAsset = userBalance.asset.find((a) => a.crypto === asset);
    if (!userAsset)
      return res.status(403).json({ message: "No asset to close" });

    const cryptoValue = Number(process.env.CURRENT_VALUE_BUY);
    if (!cryptoValue)
      return res.status(500).json({ message: "Crypto value not available" });

    const totalCloseValue = cryptoValue * quantity;

    let profitLoss = 0;
    if (type === "BUY") {
      profitLoss = totalCloseValue - userAsset.cryptoValue;
    } else if (type === "SELL") {
      profitLoss = userAsset.cryptoValue - totalCloseValue;
    }
    const releasedMargin = totalCloseValue; 
    const updatedLockedMargin = Math.max(
      userBalance.lockedMargin - releasedMargin,
      0
    );
    const updatedFreeMargin =
      userBalance.freeMargin + releasedMargin + profitLoss;
    const updatedUSD = userBalance.USD + profitLoss;

    await prisma.balance.update({
      where: { id: userBalance.id },
      data: {
        USD: updatedUSD,
        freeMargin: updatedFreeMargin,
        lockedMargin: updatedLockedMargin,
      },
    });

    await prisma.individualAsset.delete({ where: { id: userAsset.id } });

    return res.status(200).json({
      message: "Order closed successfully",
      profitLoss,
      balance: await prisma.balance.findUnique({
        where: { id: userBalance.id },
      }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error closing order", error });
  }
};

export const balanceController = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await prisma.user.findFirst({
    where: { email },
    include: { balances: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({ balance: user });
};

export const allOrders = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await prisma.user.findFirst({
    where: { email },
    include: { balances: true },
  });
  if (!user || !user.balances[0])
    return res.status(404).json({ message: "User or balance not found" });

  const orders = await prisma.individualAsset.findMany({
    where: { BalanceId: user.balances[0].id },
  });
  if (orders.length === 0)
    return res.status(200).json({ message: "No orders placed yet" });

  return res.status(200).json({ orders });
};
