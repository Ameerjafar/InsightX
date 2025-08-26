import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

interface openOrderObject {
  type: "buy" | "sell";
  quantity: number;
  asset: string;
  stopLoss?: number;
  takeProfit?: number;
}
interface closeOrderObject {
  type: "buy" | "sell";
  quantity: number;
  asset: "BTC" | "ETH" | "SOL";
}
const prisma = new PrismaClient();
export const openOrder = async (req: Request, res: Response) => {
  const email: string | null = localStorage.getItem("Email");
  if (!email) {
    return res
      .status(404)
      .json({ message: "we cannot find your email address" });
  }
  const { type, quantity, asset, stopLoss, takeProfit }: openOrderObject =
    req.body;
  const user = await prisma.user.findMany({
    where: {
      email,
    },
  });
  const userBalance = await prisma.balance.findMany({
    where: {
      userId: user[0]!.id,
    },
  });
  try {
    if (type === "buy") {
      const assetValue = asset;
      const cryptoValue = process.env[assetValue];
      const canAfford =
        userBalance[0]!.freeMargin >= parseInt(cryptoValue!) * quantity;
      if (!canAfford) {
        res.status(403).json({ message: "you don't have enough money to buy" });
      } else {
        const updateUserBalance = await prisma.balance.update({
          where: {
            id: userBalance[0]!.id,
          },
          data: {
            USD: userBalance[0]!.USD - parseInt(cryptoValue!) * quantity,
            freeMargin:
              userBalance[0]!.freeMargin - parseInt(cryptoValue!) * quantity,
            lockedMargin:
              userBalance[0]!.lockedMargin + parseInt(cryptoValue!) * quantity,
          },
        });
        const updateIndividualValue = await prisma.individualAsset.create({
          data: {
            BalanceId: userBalance[0]!.id,
            cryptoValue: parseInt(cryptoValue!) * quantity,
            type: "BUY",
            crypto: asset as any,
          },
        });
        return res.status(200).json({
          message: "your are successfully buy the prediction",
          updateIndividualValue,
        });
      }
    } else {
      const assetValue = asset;
      const cryptoValue = process.env[assetValue];
      const canAfford =
        userBalance[0]!.freeMargin >= parseInt(cryptoValue!) * quantity;
      if (!canAfford) {
        return res
          .status(403)
          .json({ message: "you don't have enough money to buy" });
      } else {
        const updateUserBalance = await prisma.balance.update({
          where: {
            id: userBalance[0]!.id,
          },
          data: {
            USD: userBalance[0]!.USD - parseInt(cryptoValue!) * quantity,
            freeMargin: userBalance[0]!.USD - parseInt(cryptoValue!) * quantity,
            lockedMargin:
              userBalance[0]!.USD + parseInt(cryptoValue!) * quantity,
          },
        });
        const updateIndividualValue = await prisma.individualAsset.create({
          data: {
            BalanceId: userBalance[0]!.id,
            cryptoValue: parseInt(cryptoValue!) * quantity,
            type: "SELL",
            crypto: asset as any,
          },
        });
        return res
          .status(200)
          .json({ message: "your are successfully sell the prediction" });
      }
    }
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const closeOrder = async (req: Request, res: Response) => {
  const email: string | null = localStorage.getItem("email");
  if (!email) {
    return res.status(404).json({ message: "We cannot find your email" });
  }

  const { type, quantity: quantity, asset }: closeOrderObject = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userBalance = await prisma.balance.findFirst({
      where: { userId: user.id },
      include: { asset: true },
    });
    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }

    const userIndividualAsset = userBalance.asset.find(
      (a) => a.crypto === asset
    );
    if (!userIndividualAsset) {
      return res
        .status(403)
        .json({ message: "You have not bought any order to close" });
    }

    const cryptoValue = Number(process.env[asset]);
    if (!cryptoValue) {
      return res.status(500).json({ message: "Cannot get crypto value" });
    }

    let profitLoss = 0;
    if (type === "buy") {
      profitLoss = (cryptoValue - userIndividualAsset.cryptoValue) * quantity;
    } else if (type === "sell") {
      profitLoss = (userIndividualAsset.cryptoValue - cryptoValue) * quantity;
    }

    await prisma.balance.update({
      where: { id: userBalance.id },
      data: {
        USD: { increment: profitLoss },
        freeMargin: { increment: profitLoss },
        lockedMargin: { decrement: userIndividualAsset.cryptoValue },
      },
    });

    if (userIndividualAsset.cryptoValue > quantity) {
      await prisma.individualAsset.update({
        where: { id: userIndividualAsset.id },
        data: { cryptoValue: userIndividualAsset.cryptoValue - quantity },
      });
    } else {
      await prisma.individualAsset.delete({
        where: { id: userIndividualAsset.id },
      });
    }

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
  const email: string | null = localStorage.getItem("email");
  if (!email) {
    return res.status(404).json({ message: "we cannot find your email" });
  }
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      balances: true,
    },
  });
  if (!user) {
    return res.status(404).json({ message: "we cannot find the user" });
  } else {
    return res.status(200).json({ message: user.balances[0]?.USD });
  }
};


export const allOrders = async (req: Request, res: Response) => {
    const email: string | null = localStorage.getItem("email");
    if (!email) {
      return res.status(404).json({ message: "we cannot find your email" });
    }
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        balances: true,
      },
    });
    const allOrders = await prisma.individualAsset.findMany({
        where: {
            BalanceId: user!.balances[0]!.id
        } 
    })
    if(!allOrders) {
        res.status(200).json({message: "you have not placed any order yet"});
    }
    else {
        res.status(200).json({message: allOrders})
    }
}