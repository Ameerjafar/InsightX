import WebSocket, { WebSocketServer } from "ws";
import { Redis } from "../pricePoller/redisClient.js";
import { PrismaClient } from "@prisma/client";
import { takeProfitAndStopLossHandler } from "../component/takeProfitAndStopLossHandler.js";
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_CLIENT as string);
await redis.connect();

const wss = new WebSocketServer({ port: 8080 });
console.log("🟢 WebSocket server running on ws://localhost:8080");

await redis.subscribe("priceChannel", (message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
});

const binanceWs = new WebSocket(
  "wss://stream.binance.com:9443/ws/btcusdt@bookTicker/solusdt@bookTicker/ethusdt@bookTicker"
);

binanceWs.on("open", () => console.log("Connected to Binance WebSocket"));

type BookTickerData = {
  askPrice: number;
  bidPrice: number;
  timestamp: number;
  midPrice: number;
};

const intervals = ["1m", "5m", "1h"] as const;
const bookTickerBuffer: Record<
  string,
  Record<(typeof intervals)[number], BookTickerData[]>
> = {
  BTC: { "1m": [], "5m": [], "1h": [] },
  ETH: { "1m": [], "5m": [], "1h": [] },
  SOL: { "1m": [], "5m": [], "1h": [] },
};
const intervalMs = { "1m": 60_000, "5m": 300_000, "1h": 3_600_000 };

binanceWs.on("message", async (data: any) => {
  const parsed = JSON.parse(data.toString());
  console.log(parsed);

  let symbol: "BTC" | "ETH" | "SOL";
  if (parsed.s.toLowerCase().includes("btcusdt")) symbol = "BTC";
  else if (parsed.s.toLowerCase().includes("ethusdt")) symbol = "ETH";
  else symbol = "SOL";

  const askPrice = parseFloat(parsed.a);
  const bidPrice = parseFloat(parsed.b);
  const midPrice = (askPrice + bidPrice) / 2;
  takeProfitAndStopLossHandler(bidPrice, askPrice);
  const bookTickerData: BookTickerData = {
    askPrice,
    bidPrice,
    midPrice,
    timestamp: Date.now(),
  };

  intervals.forEach((intv) => {
    const buffer = bookTickerBuffer[symbol];
    if (buffer && buffer[intv]) {
      buffer[intv].push(bookTickerData);
    }
  });

  console.log("Publishing book ticker data");
  await redis.publish(
    "priceChannel",
    JSON.stringify({
      type: "bookTicker",
      data: { symbol, bookTicker: bookTickerData },
    })
  );
  console.log("Published book ticker data");
});

intervals.forEach((intv) => {
  setInterval(async () => {
    for (const symbol of Object.keys(bookTickerBuffer)) {
      const buffer = bookTickerBuffer[symbol];
      const bookTickers = buffer?.[intv];
      if (!bookTickers || bookTickers.length === 0) continue;

      const midPrices = bookTickers.map((t) => t.midPrice);
      const volume = bookTickers.length;

      const ohlc = {
        open: midPrices[0] ?? 0,
        high: Math.max(...midPrices),
        low: Math.min(...midPrices),
        close: midPrices[midPrices.length - 1] ?? 0,
        volume,
        timestamp: new Date(
          Math.floor(bookTickers[0]!.timestamp / intervalMs[intv]) *
            intervalMs[intv]
        ),
      };

      console.log("This is the ohlc from bookTicker", ohlc);

      await prisma.oHLC.upsert({
        where: {
          crypto_interval_timestamp: {
            crypto: symbol,
            interval: intv,
            timestamp: ohlc.timestamp,
          },
        },
        update: {
          open: ohlc.open,
          high: ohlc.high,
          low: ohlc.low,
          close: ohlc.close,
          volume: ohlc.volume,
        },
        create: {
          crypto: symbol,
          interval: intv,
          open: ohlc.open,
          high: ohlc.high,
          low: ohlc.low,
          close: ohlc.close,
          volume: ohlc.volume,
          timestamp: ohlc.timestamp,
        },
      });

      console.log(`✅ Stored ${intv} OHLC for ${symbol} from bookTicker`, ohlc);

      if (bookTickerBuffer[symbol]) {
        bookTickerBuffer[symbol][intv] = [];
      }
    }
  }, intervalMs[intv]);
});

binanceWs.on("close", () => console.log("Binance WebSocket connection closed"));
binanceWs.on("error", (err) => console.error("Binance WebSocket error:", err));
