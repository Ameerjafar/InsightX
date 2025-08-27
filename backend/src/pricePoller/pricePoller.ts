import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import { Redis } from "./redisClient.js"; // Your Redis class

const prisma = new PrismaClient();
const redisUrl = proces.env.REDIS_CLIENT;
const redis = new Redis(redisUrl);

const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
const intervals = ["1m", "5m", "1h", "1d"];

(async () => {
  await redis.connect();
  console.log("✅ Connected to Redis");

  const wss = new WebSocketServer({ port: 8080 });
  console.log("🟢 WebSocket server running on ws://localhost:8080");

  // Subscribe once to Redis channel
  await redis.subscribe("klinesChannel", (message: string) => {
    console.log("📩 Forwarding message from Redis to WebSocket clients");
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) client.send(message);
    });
  });

  // Handle new WebSocket connections
  wss.on("connection", (ws) => {
    console.log("🟢 New browser client connected");
  });

  // Fetch Binance klines every 5 seconds and publish to Redis
  setInterval(async () => {
    try {
      console.log("Fetching Binance klines...");

      const allData: Record<string, any> = {};

      for (const symbol of symbols) {
        allData[symbol] = {};

        for (const interval of intervals) {
          const klines = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
          ).then((res) => res.json());

          allData[symbol][interval] = klines;

          // Save in DB
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

      // Publish all intervals to Redis
      await redis.publish("klinesChannel", JSON.stringify({ type: "klines", data: allData }));
    } catch (err) {
      console.error("Error fetching Binance data:", err);
    }
  }, 5000);
})();
