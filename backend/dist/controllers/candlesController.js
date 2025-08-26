import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const candlesController = async (req, res) => {
    const asset = req.query.asset;
    const queryObject = req.query;
    const { duration, startTime, endTime } = req.query;
    try {
        const info = await prisma.assetsValue.findMany({
            where: {
                crypto: asset,
            }
        });
        if (info) {
            return res.status(404).json({ message: "cannot find the crytpo from the db" });
        }
        const assetDetail = await prisma.assetsValue.findMany({
            where: {
                timestamp: {
                    gte: startTime,
                    lte: endTime
                }
            },
            orderBy: {
                timestamp: 'asc'
            },
        });
        return res.status(200).json({ message: assetDetail });
    }
    catch (error) {
        return res.status(400).json({ message: "This is the error you are getting", error });
    }
};
//# sourceMappingURL=candlesController.js.map