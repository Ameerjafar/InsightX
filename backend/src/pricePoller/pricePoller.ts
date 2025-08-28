import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import { Redis } from "./redisClient.js";

const prisma = new PrismaClient();
const redisUrl: string = process.env.REDIS_CLIENT as string;
console.log(redisUrl);
const redis = new Redis(redisUrl);

const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
const intervals = ["1m", "5m", "1h", "1d"];

(async () => {
  await redis.connect();
  console.log("✅ Connected to Redis");

  const wss = new WebSocketServer({ port: 8080 });
  console.log("🟢 WebSocket server running on ws://localhost:8080");

  await redis.subscribe("klinesChannel", (message: string) => {
    console.log("📩 Forwarding message from Redis to WebSocket clients");
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) client.send(message);
    });
  });

  wss.on("connection", (ws) => {
    console.log("🟢 New browser client connected");
  });
  setInterval(async () => {
    try {
      console.log("Fetching Binance klines...");

      const allData: Record<string, any> = {};

      for (const symbol of symbols) {
        allData[symbol] = {};

        for (const interval of intervals) {
          const klines = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=10`
          ).then((res) => res.json());

          allData[symbol][interval] = klines;
          const dbSymbol = symbol.replace("USDT", "");
          for (const kline of klines) {
            const timestamp = new Date(kline[0]);
            const price = parseFloat(kline[4]);
            await prisma.assetsValue.upsert({
              where: {
                crypto_timestamp: {
                  crypto: dbSymbol as any,
                  timestamp,
                },
              },
              update: { Price: price },
              create: { crypto: dbSymbol as any, Price: price, timestamp },
            });
          }
        }
      }
      await redis.publish("klinesChannel", JSON.stringify({ type: "klines", data: allData}));
    } catch (err) {
      console.error("Error fetching Binance data:", err);
    }
  }, 3000);
})();
