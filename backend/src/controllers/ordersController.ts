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
  cryptoValue: number
}

interface CloseOrderObject {
  email: string;
  type: "BUY" | "SELL";
  quantity: number;
  asset: string;
  cryptoValue: number
  individualAssetId: number
}

const prisma = new PrismaClient();

export const openOrder = async (req: Request, res: Response) => {
  const { email, type, quantity, asset, cryptoValue, stopLoss, takeProfit }: OpenOrderObject = req.body;

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

    // const cryptoValue = Number(process.env[asset]);
    if (!cryptoValue)
      return res.status(500).json({ message: "Crypto value not available" });
    const totalCost = cryptoValue * quantity;
    console.log(totalCost);
    if (userBalance.freeMargin < totalCost) {
      return res
        .status(403)
        .json({ message: "Insufficient free margin to buy" });
    }

    await prisma.balance.updateMany({
      where: { userId: user.id },
      data: {
        // USD: userBalance.USD - totalCost,
        freeMargin: userBalance.freeMargin - totalCost,
        lockedMargin: userBalance.lockedMargin + totalCost,
      },
    });
    if(stopLoss && takeProfit) {
      await prisma.individualAsset.create({
        data: {
          BalanceId: userBalance.id,
          cryptoValue: totalCost,
          type,
          quantity,
          stopLoss, 
          takeProfit,
          userId: user.id,
          crypto: asset as any,
        },
      });
    }
    else if(stopLoss && !takeProfit) {
      await prisma.individualAsset.create({
        data: {
          BalanceId: userBalance.id,
          cryptoValue: totalCost,
          type,
          quantity,
          stopLoss,
          userId: user.id,
          crypto: asset as any,
        },
      });
    }
    else if(takeProfit && !stopLoss) {
      await prisma.individualAsset.create({
        data: {
          BalanceId: userBalance.id,
          cryptoValue: totalCost,
          type,
          quantity,
          takeProfit,
          userId: user.id,
          crypto: asset as any,
        },
      });
    }
    else {
      await prisma.individualAsset.create({
        data: {
          BalanceId: userBalance.id,
          cryptoValue: totalCost,
          type,
          quantity,
          userId: user.id,
          crypto: asset as any,
        },
      });
    }
    // const order = await prisma.individualAsset.create({
    //   data: {
    //     BalanceId: userBalance.id,
    //     cryptoValue: totalCost,
    //     type,
    //     quantity: 1,
    //     crypto: asset as any,
    //   },
    // });

    return res
      .status(200)
      .json({ message: `${type} Buy order placed successfully` });
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

    // return res
    //   .status(200)
    //   .json({ message: "Sell order placed successfully", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error placing order", error });
  }
};

export const closeOrderController = async (req: Request, res: Response) => {
  if(await closeOrderService(req.body)) {
    res.status(200).json({message: "closed successfully"});
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
