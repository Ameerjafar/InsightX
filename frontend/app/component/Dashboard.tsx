"use client";
import axios from "axios";
import { usePricePoller, type PriceData } from "./hooks/usePricePoller";
import { Card } from "./ui/Card";
import ChartUi from "./ui/ChartUi";
import { OpenTrade } from "./ui/openTrade/OpenTrade";
import { useEffect, useState } from "react";
import { fetchOpenData } from "./services";
import { calculateProfitLoss } from "./services";
import { BalanceCard } from "./ui/BalanceCard";

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
        const response = await axios.get(
          "http://localhost:5000/orders/balance?email=r@gmail.com"
        );
        const userBalance = response.data.balance;
        
        setAllTrades(openTrades as OpenTrade[]);
        setInitialBalance(userBalance.balances[0].USD);
        setUserDynamicBalance(userBalance.balances[0].USD);
        
        // Store in localStorage for persistence
        localStorage.setItem("userBalance", String(userBalance.balances[0].USD));
        
        console.log("Initial balance set:", userBalance.balances[0].USD);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    openTradeHandler();
  }, []);

  const prices = usePricePoller();

  // Second useEffect: Calculate profit/loss and update dynamic balance
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
    
    // Update dynamic balance (initial + profit/loss)
    const newDynamicBalance = initialBalance + totalProfitLoss;
    setUserDynamicBalance(newDynamicBalance);
    
    // Calculate margin
    setTotalMargin(totalOpenTradesValue);
    setFreeMargin(newDynamicBalance - totalOpenTradesValue);
    
  }, [prices, allTrades, initialBalance]);

  // Calculate if user is in profit or loss
  const isProfit = userDynamicBalance >= initialBalance;
  const profitLossAmount = userDynamicBalance - initialBalance;
  const profitLossText = isProfit 
    ? `+$${profitLossAmount.toFixed(2)} profit` 
    : `-$${Math.abs(profitLossAmount).toFixed(2)} loss`;

  return (
    <div className="min-h-screen bg-[#141619]">
      <div>
        <div className="flex p-20 pb-0 pl-10 text-3xl text-white font-bold">
          Trading Dashboard
        </div>
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