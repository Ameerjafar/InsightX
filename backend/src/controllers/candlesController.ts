import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
export const interValInfo = async (req: Request, res: Response) => {
  const { asset, startTime, endTime, interval } = req.query;
  const currentInterval = interval as any;
  let crypto = asset as any;
  console.log("This is running");
  console.log(new Date(startTime as any), new Date(endTime as any));
  if(crypto === 'BTCUSDT') crypto = "BTC";
  else if(crypto === 'SOLUSDT') crypto = "SOL";
  else crypto = "ETH";
  console.log(crypto, interval);
  try {
    const candles = await prisma.oHLC.findMany({
      where: {
        crypto,
        interval: currentInterval,
        timestamp: {
          gte: new Date(startTime as string), 
          lte: new Date(endTime as string)
        },
      },
    });
    return res.status(200).json({ candles });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "You are getting this error", error });
  }
};
