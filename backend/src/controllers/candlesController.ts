
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();
type AssetType = "BTC" | "SOL" | "ETH";

interface QueryObject {
    duration?: number,
    startTime?: Date,
    endTime?: Date
}
export const candlesController = async (req: Request, res: Response) => {
    const asset = req.query.asset as AssetType; 
    const queryObject = req.query as unknown as QueryObject;
    const { duration, startTime, endTime } = req.query as unknown as QueryObject;
    try {
        const info = await prisma.assetsValue.findMany({
            where: {
                crypto: asset,
            }
        });
        if(info) {
            return res.status(404).json({message: "cannot find the crytpo from the db"});
        }
        const assetDetail = await prisma.assetsValue.findMany({
            where: {
                timestamp: {
                    gte: startTime!,
                    lte: endTime!
                }
            },
            orderBy: {
                timestamp: 'asc'
              },
        })
        return res.status(200).json({message: assetDetail});

    }catch(error) {
        return res.status(400).json({message: "This is the error you are getting", error});
    }
}