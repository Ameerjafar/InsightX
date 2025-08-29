import WebSocket, { WebSocketServer } from "ws";
import { Redis } from "./redisClient.js";

type symbolOfCrypto = "BTC" | "ETH" | "SOL";
let symbol: symbolOfCrypto = "BTC";

const redis = new Redis(
  "rediss://default:AVNS_oNzMauPhMHsQ7Y-7qDG@caching-754685e-ameerjafar123-f2d0.f.aivencloud.com:12091"
);
await redis.connect();

const wss = new WebSocketServer({ port: 8080 });
console.log("🟢 WebSocket server running on ws://localhost:8080");

await redis.subscribe("priceChannel", (message: string) => {
  console.log("📩 Forwarding message from Redis to WebSocket clients");
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
});

const binanceWs = new WebSocket(
  "wss://stream.binance.com:9443/stream?streams=btcusdt@bookTicker/ethusdt@bookTicker/solusdt@bookTicker"
);

binanceWs.on("open", () => console.log("Connected to Binance WebSocket"));

binanceWs.on("message", async (data: any) => {
  const parsed = JSON.parse(data.toString());
  const stream = parsed.stream;
  const trade = parsed.data;

  if (trade.s.toLowerCase().includes("btcusdt")) {
    symbol = "BTC";
  } else if (trade.s.toLowerCase().includes("ethusdt")) {
    symbol = "ETH";
  } else {
    symbol = "SOL";
  }

  const payload = JSON.stringify({
    symbol,
    trade,
    timestamp: Date.now(),
  });

  await redis.enqueue("tradeQueue", payload);
  console.log(`📥 Enqueued trade for ${symbol}`);

  await redis.publish(
    "priceChannel",
    JSON.stringify({ type: "pricePoller", data: parsed })
  );
});

binanceWs.on("close", () => {
  console.log("Binance WebSocket connection closed");
} );
binanceWs.on("error", (err) => console.error("Binance WebSocket error:", err));
