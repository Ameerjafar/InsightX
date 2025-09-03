"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { usePricePoller } from "../hooks/usePricePoller";

export const TradingPanel = () => {
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(0.01);
  const [email, setEmail] = useState<string>("");
  const [asset, setAsset] = useState<"BTC" | "ETH" | "SOL">("BTC");
  const [activeType, setActiveType] = useState<"buy" | "sell">("buy");
  const [activeAsset, setActiveAsset] = useState<"BTC" | "ETH" | "SOL">("BTC");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [selectedLeverage, setSelectedLeverage] = useState<number>(1);
  const [selectTakeProfit, setSelectTakeProfit] = useState(false);
  const [selectStopLoss, setSelectStopLoss] = useState(false);
  const [currentPriceLoading, setCurrentPriceLoading] =
    useState<boolean>(false);
  const prices = usePricePoller();

  useEffect(() => {}, [prices]);


  useEffect(
    () => setType(activeType.toUpperCase() as "BUY" | "SELL"),
    [activeType]
  );
  useEffect(() => setAsset(activeAsset), [activeAsset]);
  const leverageOptions = [1, 2, 5, 10, 20, 50, 100];
  const sumbitHandler = async () => {
    console.log(
      "This is the body of openOrder",
      email,
      type,
      quantity,
      asset
    );
    const response = await axios.post(
      "http://localhost:5000/orders/openOrder",
      {
        email: localStorage.getItem("userEmail"),
        type,
        quantity,
        asset,
        leverageStatus: false,
        cryptoValue:
          type === "BUY" ? prices[asset].ask[0] : prices[asset].bid[0],
      }
    );
    console.log(response.data);
    toast.success(`${type} order is placed`);
  };
  const quantiyController = (e) => {
    console.log(e.target.value);
    setQuantity(Number(e.target.value));
    let price = 0;
    if (type === "BUY") {
      price = prices[asset].ask[0] * quantity;
    } else {
      price = prices[asset].bid[0] * quantity;
    }
    setCurrentPriceLoading(true);
    setCurrentPrice(price);
    setCurrentPriceLoading(false);
  };
  return (
    <div className="text-white w-lg mr-11">
      <div className="border border-gray-500 mt-5 rounded-md p-4 bg-[#141619]">
        <div className="text-white text-xl font-bold mb-2">Trading Panel</div>

        <div className="relative flex w-full mt-2 rounded-md bg-[#111315] h-12">
          <div
            className={`absolute top-0 h-full w-1/2 ${
              activeType === "buy" ? "bg-green-500" : "bg-red-500"
            } rounded-md transition-all duration-300`}
            style={{
              transform:
                activeType === "buy" ? "translateX(0%)" : "translateX(100%)",
            }}
          ></div>

          <button
            className={`flex-1 z-10 text-center font-bold ${
              activeType === "buy" ? "text-black" : "text-white"
            }`}
            onClick={() => setActiveType("buy")}
          >
            Buy
          </button>
          <button
            className={`flex-1 z-10 text-center font-bold ${
              activeType === "sell" ? "text-black" : "text-white"
            }`}
            onClick={() => setActiveType("sell")}
          >
            Sell
          </button>
        </div>
        <div className="relative flex w-full mt-4 rounded-md bg-[#111315] h-12">
          <div
            className={`absolute top-0 h-full w-1/3 bg-yellow-300 rounded-md transition-all duration-300`}
            style={{
              transform:
                activeAsset === "BTC"
                  ? "translateX(0%)"
                  : activeAsset === "ETH"
                  ? "translateX(100%)"
                  : "translateX(200%)",
            }}
          ></div>

          <button
            className={`flex-1 z-10 text-center font-bold ${
              activeAsset === "BTC" ? "text-black" : "text-white"
            }`}
            onClick={() => setActiveAsset("BTC")}
          >
            BTC
          </button>
          <button
            className={`flex-1 z-10 text-center font-bold ${
              activeAsset === "ETH" ? "text-black" : "text-white"
            }`}
            onClick={() => setActiveAsset("ETH")}
          >
            ETH
          </button>
          <button
            className={`flex-1 z-10 text-center font-bold ${
              activeAsset === "SOL" ? "text-black" : "text-white"
            }`}
            onClick={() => setActiveAsset("SOL")}
          >
            SOL
          </button>
        </div>
        <div className="mt-4 font-semibold text-lg">leverage percentage</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {leverageOptions.map((lev) => (
            <button
              key={lev}
              onClick={() => setSelectedLeverage(lev)}
              className={`px-3 py-1 rounded-md font-bold text-sm transition-colors duration-200 ${
                selectedLeverage === lev
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
        <div className="flex mt-2 font-semibold text-lg outline-0">
          quantity
        </div>
        <div className="flex bg-[#1a1c1e] rounded-md outline-0">
          <input
            onChange={quantiyController}
            placeholder="0.01"
            className="mt-2 text-white w-full p-2"
          ></input>
        </div>
        <div className="flex justify-between items-center mt-4 p-3 bg-[#1a1c1e] rounded-md">
          <span className="text-white font-semibold">bid price</span>
          {currentPriceLoading ? (
            <div>Loading</div>
          ) : (
            <span className="text-yellow-400 font-bold">
              {currentPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex justify-between mt-2">
          <div className="mt-2 font-bold text-lg">Take Profit</div>
          <button
            onClick={() => {
              setSelectTakeProfit(!selectTakeProfit);
            }}
            className="bg-[#1a1c1e] p-3 rounded-md font-bold hover:bg-green-500 hover:text-black"
          >
            {selectTakeProfit ? "ON" : "OFF"}
          </button>
        </div>
        {selectTakeProfit && (
          <div className="flex bg-[#1a1c1e] rounded-md outline-0 mt-3">
            <input
              placeholder="0.01"
              className="mt-2 text-white w-full p-2"
            ></input>
          </div>
        )}
        <div className="flex justify-between mt-2">
          <div className="mt-2 font-bold text-lg">Stop Loss</div>
          <button
            onClick={() => {
              setSelectStopLoss(!selectStopLoss);
            }}
            className="bg-[#1a1c1e] p-3 rounded-md font-bold hover:bg-green-500 hover:text-black"
          >
            {selectStopLoss ? "ON" : "OFF"}
          </button>
        </div>
        {selectStopLoss && (
          <div className="flex bg-[#1a1c1e] rounded-md outline-0 mt-3">
            <input
              placeholder="0.01"
              className="mt-2 text-white w-full p-2"
            ></input>
          </div>
        )}
        <button
          onClick={sumbitHandler}
          className="bg-green-500 w-full text-center mt-4 hover:bg-green-700 rounded-md p-3 font-bold"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};
