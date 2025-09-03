import { Request, Response } from "express";
import { closeOrderService } from "../services/closeOrderService.js";
import { prisma } from "../lib/prisma.js";

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
  
  console.log("Opening order:", email, asset, quantity);
  
  if (!email || !asset || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userBalance = await prisma.balance.findFirst({
      where: { userId: user.id },
    });

    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }
    
    if (!cryptoValue) {
      return res.status(500).json({ message: "Crypto value not available" });
    }

    const totalCost = cryptoValue * quantity;
    console.log("Total cost:", totalCost);
    
    const leverageMargin = cryptoValue / leveragePercent;

    if (leverageStatus) {
      if (userBalance.freeMargin < (totalCost / leveragePercent)) {
        return res.status(403).json({ 
          message: "Insufficient free margin to open this leveraged order" 
        });
      }
    } else {
      if (userBalance.freeMargin < totalCost) {
        return res.status(403).json({ 
          message: "Insufficient free margin to open this order" 
        });
      }
    }
    await prisma.$transaction(async (tx) => {
      await tx.balance.updateMany({
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
      await tx.individualAsset.create({
        data: {
          BalanceId: userBalance.id,
          cryptoValue: totalCost,
          type,
          quantity,
          stopLoss: stopLoss || null,
          takeProfit: takeProfit || null,
          userId: user.id,
          leverageStatus,
          leveragePercent: leverageStatus ? leveragePercent : null,
          crypto: asset as any,
        },
      });
    });

    return res.status(200).json({ 
      message: `${type} order placed successfully`,
      orderDetails: {
        asset,
        quantity,
        totalCost,
        leverageStatus,
        leveragePercent: leverageStatus ? leveragePercent : null,
        stopLoss: stopLoss || null,
        takeProfit: takeProfit || null,
      }
    });

  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ 
      message: "Error placing order", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const closeOrderController = async (req: Request, res: Response) => {
  try {
    const response = await closeOrderService(req.body);
    res.status(200).json({ message: response });
  } catch (error) {
    console.error("Error closing order:", error);
    res.status(500).json({ 
      message: "Error closing order", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const balanceController = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      include: { balances: true },
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ balance: user });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return res.status(500).json({ 
      message: "Error fetching balance", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const allOrders = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      include: { balances: true },
    });
    
    if (!user || !user.balances[0]) {
      return res.status(404).json({ message: "User or balance not found" });
    }

    const orders = await prisma.individualAsset.findMany({
      where: { userId: user.id },
    });
    
    if (orders.length === 0) {
      return res.status(200).json({ message: "No orders placed yet" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ 
      message: "Error fetching orders", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const cleanup = async () => {
  await prisma.$disconnect();
};
