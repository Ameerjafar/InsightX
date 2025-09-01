"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import { PriceDisplay } from "../priceDisplay";
import { TradingPanel } from "./TrackingPanel";
import axios from "axios";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Candle = {
  x: Date;
  y: number[];
};

const intervals = ["1m", "5m", "1h"];

export default function ChartUi() {
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState<Interval>("1m");
  type Interval = "1m" | "5m" | "1h";
  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      width: "900",
      animations: { enabled: true },
      toolbar: {
        show: false,
      },
    },
    // title: {
    //     text: `${selectedSymbol} (${selectedInterval}) Candlestick Chart`,
    //     align: "left",
    //   },
    xaxis: {
      type: "datetime",
      tickAmount: 50,
      labels: {
        style: {
          colors: "#FFFAFA",
        },
      },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: {
          colors: "#FFFAFA",
        },
      },
      tickAmount: 7,
    },
  };
  useEffect(() => {
    console.log("This is running inside the use effect");
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/candles?asset=${selectedSymbol}&interval=${selectedInterval}&startTime=2025-08-30T09:36:00.000Z&endTime=2025-08-30T09:45:00.000Z`
        );
        console.log(response);
        const candles = response.data.candles;
        const Data = candles.map((candle: any) => ({
          x: new Date(candle.timestamp), // timestamp
          y: [
            parseFloat(candle.open),
            parseFloat(candle.high),
            parseFloat(candle.low),
            parseFloat(candle.close),
          ],
        }));
        console.log(candles);
        setChartData(Data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [selectedSymbol, selectedInterval]);
  return (
    <div className="bg-[#141619] min-h-screen">
      <div className="flex">
        <div className="m-10 h-1/2 w-3/5 p-5 rounded-md mt-5 shadow-2xl border border-gray-700">
          {/* <div>
        <div className = {`${btcValue[1] ? "text-green-400" : "text-red-500"} text-xl`}>{btcValue[0]}</div>
        </div> */}
          <div className="flex justify-between">
            <select
              className="text-white bg-[#141619] outline-0 rounded-full"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
            >
              <option value="BTCUSDT">BTC</option>
              <option value="SOLUSDT">SOL</option>
              <option value="ETHUSDT">ETH</option>
            </select>
            {/* <div className="flex gap-4">
        {["BTCUSDT", "ETHUSDT", "SOLUSDT"].map((sym) => (
          <button
            key={sym}
            onClick={() => setSelectedSymbol(sym)}
            className={`px-4 py-2 rounded ${
              selectedSymbol === sym ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {sym.replace("USDT", "")}
          </button>
        ))}
        </div> */}
            <div className="space-x-4">
              {intervals.map((intv) => (
                <button
                  key={intv}
                  onClick={() => setSelectedInterval(intv)} // ✅ fixed here
                  className={`px-4 py-2 rounded-md hover:bg-amber-600 hover:text-black  text-[#a49d88] font-semibold ${
                    selectedInterval === intv
                      ? "bg-yellow-300 text-black"
                      : "bg-[#141619]"
                  }`}
                >
                  {intv}
                </button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <Chart
              options={options}
              series={[{ data: chartData }]}
              type="candlestick"
              height={450}
            />
          ) : (
            <p>Loading chart...</p>
          )}
          <hr className="border-1 border-gray-400 mt-1"></hr>
          <div className="flex justify-between m-4 mb-0">
            <div>
              {/* <div className="flex">
              <div className="text-white text-lg font-semibold mr-6">
                Bid Price
              </div>
              <div className="text-white text-lg font-semibold">Ask Price</div>
            </div> */}
              <div>
                <PriceDisplay selectedSymbol={selectedSymbol} />
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-500 hover:bg-green-700 text-white p-3 rounded-md w-20">
                Buy
              </button>
              <button className="bg-red-500 hover:bg-red-700 text-white p-3 rounded-md w-20">
                Sell
              </button>
            </div>
          </div>
        </div>
        <div>
        <TradingPanel />
      </div>
      </div>
    </div>
  );
}
