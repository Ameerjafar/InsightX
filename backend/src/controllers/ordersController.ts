import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { closeOrderService } from "../services/closeOrderService.js";
interface OpenOrderObject {
  email: string;
  type: "BUY" | "SELL";
  quantity: number;
  asset: string;
  stopLoss?: number;
  takeProfit?: number;
  cryptoValue: number;

  leveragePercent: number;
  leverageStatus: boolean;
  leverageValue: number;
}
const prisma = new PrismaClient();

export const openOrder = async (req: Request, res: Response) => {
  const {
    email,
    type,
    quantity,
    asset,
    cryptoValue,
    stopLoss,
    takeProfit,
    leverageStatus,
    leveragePercent,
  }: OpenOrderObject = req.body;

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
    if (!cryptoValue)
      return res.status(500).json({ message: "Crypto value not available" });

    const totalCost = cryptoValue * quantity;
    console.log("This is the total cost", totalCost);
    console.log(totalCost);
    const leverageMargin = cryptoValue / leveragePercent;
    if (leverageStatus) {
    }
    if (leverageStatus) {
      if (userBalance.freeMargin < (totalCost / leveragePercent)) {
        return res
          .status(200)
          .json({ message: "You don't have balance to open this order" });
      }
    }
    if (userBalance.freeMargin < (totalCost / leveragePercent)) {
      return res
        .status(403)
        .json({ message: "Insufficient free margin to buy" });
    }

    await prisma.balance.updateMany({
      where: { userId: user.id },
      data: {
        freeMargin: leverageStatus
          ? userBalance.freeMargin - totalCost / leveragePercent 
          : userBalance.freeMargin - totalCost,
        lockedMargin: !leverageStatus
          ? userBalance.lockedMargin + totalCost
          : userBalance.lockedMargin + leverageMargin,
      },
    });
    await prisma.individualAsset.create({
      data: {
        BalanceId: userBalance.id,
        cryptoValue: totalCost,
        type,
        quantity,
        stopLoss: stopLoss ? stopLoss : null,
        takeProfit: takeProfit ? takeProfit : null,
        userId: user.id,
        leverageStatus,
        leveragePercent: leverageStatus ? leveragePercent : null,
        crypto: asset as any,
      },
    });

    return res
      .status(200)
      .json({ message: `${type} order placed successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error placing order", error });
  }
};

export const closeOrderController = async (req: Request, res: Response) => {
  const response = await closeOrderService(req.body);
  if (response) {
    res.status(200).json({ message: response });
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
