"use client";
import axios from "axios";
import { usePricePoller, type PriceData } from "./hooks/usePricePoller";
import { Card } from "./ui/Card";
import ChartUi from "./ui/ChartUI";
import { OpenTrade } from "./ui/openTrade/OpenTrade";
import { useEffect, useState } from "react";
import { fetchOpenData } from "./services";
import { calculateProfitLoss } from "./services";
import { BalanceCard } from "./ui/BalanceCard";
import { Navigation } from "./ui/Navigation";

type OpenTrade = {
  crypto: keyof PriceData;
  cryptoValue: number;
  quantity: number;
  type: "BUY" | "SELL";
};

export const Dashboard = () => {
  const [allTrades, setAllTrades] = useState<OpenTrade[] | null>(null);
  const [userDynamicBalance, setUserDynamicBalance] = useState<number>(0);
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [totalMargin, setTotalMargin] = useState<number>(0);
  const [freeMargin, setFreeMargin] = useState<number>(0);

  // First useEffect: Fetch initial data and set up balance
  useEffect(() => {
    const openTradeHandler = async () => {
      try {
        const openTrades = await fetchOpenData();
        setAllTrades(openTrades as OpenTrade[]);

        const storedBalance: string =  localStorage.getItem("userBalance")!;
        const storedFreeMargin = localStorage.getItem("freeMargin");
        const storedLockedMargin = localStorage.getItem("lockedMargin");

        if (Number(storedBalance) > 0) {
          setInitialBalance(parseFloat(storedBalance));
          setUserDynamicBalance(parseFloat(storedBalance)); 
          setFreeMargin(parseFloat(storedFreeMargin!));
          setTotalMargin(parseFloat(storedLockedMargin!));
        } else {
          const userEmail = localStorage.getItem("userEmail");
          if (userEmail) {
            const response = await axios.get(
              `${
                process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000"
              }/orders/balance?email=${userEmail}`,
            );
            const userBalance = response.data.balance;

            if (userBalance?.balances[0]?.USD) {
              const balance = userBalance.balances[0].USD;
              const freeMargin = userBalance.balances[0].freeMargin || 0;
              const lockedMargin = userBalance.balances[0].lockedMargin || 0;

              setInitialBalance(balance);
              setUserDynamicBalance(balance);
              setFreeMargin(freeMargin);
              setTotalMargin(lockedMargin);
              
              localStorage.setItem("userBalance", balance);
              localStorage.setItem("freeMargin", freeMargin);
              localStorage.setItem("lockedMargin", lockedMargin);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    openTradeHandler();
  }, []);

  const prices = usePricePoller();
  useEffect(() => {
    if (!allTrades || !initialBalance) return;

    let totalProfitLoss = 0;
    let totalOpenTradesValue = 0;

    allTrades.forEach((openTrade) => {
      const profitLoss = calculateProfitLoss(
        openTrade.cryptoValue,
        openTrade.quantity,
        openTrade.type,
        prices[openTrade.crypto]?.bid[0] || 0,
        prices[openTrade.crypto]?.ask[0] || 0
      );

      totalProfitLoss += profitLoss;
      totalOpenTradesValue += openTrade.cryptoValue;
    });
    const newDynamicBalance = initialBalance + totalProfitLoss;
    setUserDynamicBalance(newDynamicBalance);
    setTotalMargin(totalOpenTradesValue);
    const newFreeMargin = newDynamicBalance - totalOpenTradesValue;
    setFreeMargin(newFreeMargin);
    localStorage.setItem("userBalance", newDynamicBalance.toString());
    localStorage.setItem("freeMargin", newFreeMargin.toString());
    localStorage.setItem("lockedMargin", totalOpenTradesValue.toString())
  }, [prices, allTrades, initialBalance]);
  const isProfit = userDynamicBalance >= initialBalance;
  const profitLossAmount = userDynamicBalance - initialBalance;
  const profitLossText = isProfit
    ? `+$${profitLossAmount.toFixed(2)} profit`
    : `-$${Math.abs(profitLossAmount).toFixed(2)} loss`;

  return (
    <div className="min-h-screen bg-[#141619]">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="p-20 pb-0 pl-10">
        <div className="text-3xl text-white font-bold">Trading Dashboard</div>
      </div>

      <div className="flex justify-between p-10 pt-2 text-[#cac6ae] text-md">
        <div className="text-lg">
          Monitor your portfolio and trade efficiently
        </div>
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500 mt-2 animate-ping"></div>
          <div className="text-lg">Market Open</div>
        </div>
      </div>

      <div className="flex space-x-5 mx-10">
        <BalanceCard
          arg1="Total Balance"
          arg2={`$${userDynamicBalance.toFixed(2)}`}
          arg3={profitLossText}
          svgNumber={0}
          isProfit={isProfit}
        />

        <Card
          arg1="Total Margin"
          arg2={`$${totalMargin.toFixed(2)}`}
          arg3="Used in open trades"
          svgNumber={1}
        />

        <Card
          arg1="Free Margin"
          arg2={`$${freeMargin.toFixed(2)}`}
          arg3="Available for trading"
          svgNumber={2}
        />

        <Card
          arg1="Active Trades"
          arg2={allTrades ? allTrades.length.toString() : "0"}
          arg3="Open positions"
          svgNumber={3}
        />
      </div>

      <div className="mt-3">
        <ChartUi />
      </div>
      <div>
        <OpenTrade />
      </div>
    </div>
  );
};
