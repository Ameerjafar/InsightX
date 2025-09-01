"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export const TradingPanel = () => {
  const [placeOrder, setPlaceOrder] = useState(false);
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [asset, setAsset] = useState<"BTC" | "ETH" | "SOL">("BTC");
  const [activeType, setActiveType] = useState<"buy" | "sell">("buy");
  const [activeAsset, setActiveAsset] = useState<"BTC" | "ETH" | "SOL">("BTC");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [selectedLeverage, setSelectedLeverage] = useState<number>(1);

  // Fetch current price periodically
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/price?asset=${asset}`);
        setCurrentPrice(response.data.price);
      } catch (err) {
        console.error("Error fetching price:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => clearInterval(interval);
  }, [asset]);

  useEffect(() => setType(activeType.toUpperCase() as "BUY" | "SELL"), [activeType]);
  useEffect(() => setAsset(activeAsset), [activeAsset]);

  // Generate leverage options: 1x, 2x, 5x, 10x, 20x, 50x, 100x
  const leverageOptions = [1, 2, 5, 10, 20, 50, 100];

  return (
    <div className="text-white w-lg mr-11">
      <div className="border border-gray-500 mt-5 rounded-md p-4 bg-[#111315]">
        <div className="text-white text-xl font-bold mb-2">Trading Panel</div>

        {/* Buy / Sell Toggle */}
        <div className="relative flex w-full mt-2 rounded-md bg-[#111315] h-12">
          <div
            className={`absolute top-0 h-full w-1/2 bg-green-500 rounded-md transition-all duration-300`}
            style={{ transform: activeType === "buy" ? "translateX(0%)" : "translateX(100%)" }}
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

        {/* Asset Toggle (BTC / ETH / SOL) */}
        <div className="relative flex w-full mt-4 rounded-md bg-[#111315] h-12">
          <div
            className={`absolute top-0 h-full w-1/3 bg-blue-500 rounded-md transition-all duration-300`}
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

        {/* Current Price */}
        <div className="flex justify-between items-center mt-4 p-3 bg-[#1a1c1e] rounded-md">
          <span className="text-white font-medium">Current Price:</span>
          <span className="text-yellow-400 font-bold">{currentPrice.toFixed(2)}</span>
        </div>

        {/* Leverage / Volume Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
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
      </div>
    </div>
  );
};
