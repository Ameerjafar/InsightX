import { Redis } from "../pricePoller/redisClient.js"; // updated class
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const redis = new Redis(
  "rediss://default:AVNS_oNzMauPhMHsQ7Y-7qDG@caching-754685e-ameerjafar123-f2d0.f.aivencloud.com:12091"
);

await redis.connect();

async function processQueue() {
  while (true) {
    // Wait until there's a message in the queue
    const message = await redis.dequeue("tradeQueue");
    console.log("This is the message");

    if (message) {
      const { symbol, trade, timestamp } = JSON.parse(message);

      const rounded = new Date(Math.floor(timestamp / 1000) * 1000);

      const value = await prisma.assetsValue.upsert({
        where: {
          crypto_timestamp: {
            crypto: symbol,
            timestamp: rounded,
          },
        },
        update: {
          buyPrice: parseFloat(trade.b),
          sellPrice: parseFloat(trade.a),
          bidQuantity: parseFloat(trade.B),
          askQuantity: parseFloat(trade.A),
        },
        create: {
          crypto: symbol,
          timestamp: rounded,
          buyPrice: parseFloat(trade.b),
          sellPrice: parseFloat(trade.a),
          bidQuantity: parseFloat(trade.B),
          askQuantity: parseFloat(trade.A),
        },
      });

      console.log(`✅ Stored trade in DB for ${symbol}`, value);
    }
  }
}

processQueue().catch(console.error);
