import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export const candlesController = async (req: Request, res: Response) => {
    const { asset, startTime, endTime, duration } = req.query;
    const dur = duration as "1m" | "5m" | "1h" | "1d";
  
    let intervalMs = 1000 * 60; 
    if (dur === "5m") intervalMs = 1000 * 60 * 5;
    else if (dur === "1h") intervalMs = 1000 * 60 * 60;
    else if (dur === "1d") intervalMs = 1000 * 60 * 60 * 24;
  
    let candles = [];
    let currentStart = new Date(startTime as any);
    const currentEndTime = new Date(endTime as any);

    console.log("This is outside of the loop");
    console.log(currentStart < currentEndTime);
    const price = await prisma.assetsValue.findMany({
        take: 10
      })
      console.log("hello", price);
    while (candles.length < 10 && currentStart < currentEndTime) {
        console.log("This is inside of the loop");
        console.log("")
      const currentEnd = new Date(currentStart.getTime() + intervalMs);
      console.log(currentEnd)
      const prices = await prisma.assetsValue.findMany({
        where: {
          crypto: asset as any,
          timestamp: { gte: currentStart, lt: currentEnd },
        },
        orderBy: { timestamp: "asc" },
        take: 5
      });
      console.log("this is your price", prices);
      if (prices.length > 0) {
        const open = prices[0]!.buyPrice;
        const close = prices[prices.length - 1]?.buyPrice;
        const high = Math.max(...prices.map((p) => p.buyPrice));
        const low = Math.min(...prices.map((p) => p.buyPrice));
  
        candles.push({ timestamp: currentStart, open, high, low, close });
        console.log(candles);
      }
      currentStart = currentEnd;
    }
  
    res.status(200).json({ candles }); 
  };
  