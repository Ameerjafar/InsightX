import { useState, useEffect, useRef } from "react";

export type PriceValue = [number, boolean];

export interface PriceData {
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
        console.log("This is inside the book ticker")
        const { symbol, bookTicker }: { symbol: string, bookTicker: any} = data.data;
        console.log("This is the bid price", bookTicker.bidPrice);
        setPrices((prev) => {
          if (!(symbol in prev)) return prev; 
          return {
            ...prev, 
            [symbol]: {
              bid: [
                bookTicker.bidPrice,
                bookTicker.bidPrice > prev[symbol].bid[0],
              ],
              ask: [
                bookTicker.askPrice,
                prev[symbol].ask[0] > bookTicker.askPrice,
              ],
            },
          };
        });
        console.log(prices);
      }
    };

    ws.onerror = (err) => console.log("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    return () => wsRef.current?.close();
  }, []);

  return prices;
};
