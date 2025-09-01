import { useState, useEffect, useRef } from "react";

type PriceValue = [number, boolean];

interface PriceData {
  BTC: { bid: PriceValue; ask: PriceValue };
  ETH: { bid: PriceValue; ask: PriceValue };
  SOL: { bid: PriceValue; ask: PriceValue };
}

export const usePricePoller = () => {
  const [prices, setPrices] = useState<PriceData>({
    BTC: { bid: [0, false], ask: [0, false] },
    ETH: { bid: [0, false], ask: [0, false] },
    SOL: { bid: [0, false], ask: [0, false] },
  });

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to WebSocket");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "bookTicker") {
        const { symbol, bookTicker }: { symbol: string, bookTicker: any} = data.data;

        setPrices((prev) => {
          if (!(symbol in prev)) return prev; 
          return {
            ...prev,
            [symbol]: {
              bid: [
                bookTicker.bidPrice,
                prev[symbol].bid[0] < bookTicker.bidPrice,
              ],
              ask: [
                bookTicker.askPrice,
                prev[symbol].ask[0] > bookTicker.askPrice,
              ],
            },
          };
        });
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    return () => wsRef.current?.close();
  }, []);

  return prices;
};
