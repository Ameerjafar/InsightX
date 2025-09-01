"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { usePricePoller } from "../../hooks/usePricePoller";

interface TradeCompoentObject {
  asset: string;
  type: "BUY" | "SELL";
}

interface OpenTradeObject {
  id: number;
  cryptoValue: number;
  quantity: number;
  crypto: "SOL" | "BTC" | "ETH";
  type: "BUY" | "SELL";
  stopLoss?: number | null;
  takeProfit?: number | null;
  userId: number;
  leveragePercent?: number | null;
  leverageStatus: boolean;
  BalanceId: number;
}

export const OpenTradeComponent = ({ asset, type }: TradeCompoentObject) => {
  const prices = usePricePoller();
  const [allOpenTrades, setAllOpenTrades] = useState<OpenTradeObject[]>([]);

  useEffect(() => {
    const fetchOpenData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("I did not find token on the local storage");
        return;
      }

      const decodeData: any = jwt.decode(token);
      if (!decodeData || !decodeData.email) {
        console.log("Invalid token or email missing in token");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/orders/allOrders?email=r@gmail.com`
        );
        const openTrades = response.data.orders;
        setAllOpenTrades(openTrades);
      } catch (err) {
        console.error("Error fetching open data:", err);
      }
    };
    fetchOpenData();
  }, []);
  useEffect(() => {}, [prices]);

  const calculateProfitLoss = (
    entry: number,
    quantity: number,
    type: "BUY" | "SELL",
    bidPrice: number,
    askPrice: number
  ) => {
    const entryTotalValue = entry;

    if (type === "BUY") {
      const currentValue = bidPrice * quantity;
      return currentValue - entryTotalValue;
    } else {
      const currentValue = askPrice * quantity;
      return entryTotalValue - currentValue;
    }
  };

  return (
    <div>
      {allOpenTrades.map((openTrade, ind) => {
        const profitLoss = calculateProfitLoss(
          openTrade.cryptoValue,
          openTrade.quantity,
          openTrade.type,
          prices[openTrade.crypto].bid[0],
          prices[openTrade.crypto].ask[0]
        );

        return (
          <div
            key={ind}
            className="bg-[#16191D] shadow-2xl border border-gray-700 w-full text-white p-2 rounded-md"
          >
            <div className="flex justify-between">
              <div className="text-lg font-semibold pt-3">{asset}</div>
              <div className="flex space-x-5">
                <div className="text-sm pt-2 text-gray-400">
                  <div>Entry: {openTrade.cryptoValue}</div>
                  <div>
                    Current:{" "}
                    <span
                      className={
                        profitLoss >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {profitLoss.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pr-2">
                  <div
                    className={`font-semibold ${
                      profitLoss >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {profitLoss.toFixed(2)}
                  </div>
                  <div className="w-20 text-center bg-yellow-500 rounded-md p-1 text-sm">
                    {type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
