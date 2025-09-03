"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import { PriceDisplay } from "../priceDisplay";
import { TradingPanel } from "./TrackingPanel";
import axios from "axios";
import { Candle, getDummyData, defaultDummyData } from "../data/dummyChartData";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Interval = "1m" | "5m" | "1h";

const intervals: Interval[] = ["1m", "5m", "1h"];

export default function ChartUi() {
  const [chartData, setChartData] = useState<Candle[]>(defaultDummyData);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState<Interval>("1m");

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      width: "900",
      animations: { enabled: true },
      toolbar: {
        show: false,
      },
      background: '#141619',
    },
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
    grid: {
      borderColor: '#374151',
      strokeDashArray: 5,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10B981',
          downward: '#EF4444',
        },
        wick: {
          useFillColor: true,
        },
      },
    },
  };

  // useEffect(() => {
  //   console.log("This is running inside the use effect");
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:5000/candles?asset=${selectedSymbol}&interval=${selectedInterval}&startTime=2025-08-30T09:36:00.000Z&endTime=2025-08-30T09:45:00.000Z`
  //       );
  //       console.log(response);
  //       const candles = response.data.candles;
  //       const Data = candles.map((candle: { timestamp: string; open: string; high: string; low: string; close: string }) => ({
  //         x: new Date(candle.timestamp), 
  //         y: [
  //           parseFloat(candle.open),
  //           parseFloat(candle.high),
  //           parseFloat(candle.low),
  //           parseFloat(candle.close),
  //         ],
  //       }));
  //       console.log(candles);
  //       setChartData(Data);
  //     } catch (err) {
  //       console.error(err);
  //       // Fallback to dummy data if API fails
  //       const dummyData = getDummyData(selectedSymbol);
  //       setChartData(dummyData);
  //     }
  //   };

  //   fetchData();
  // }, [selectedSymbol, selectedInterval]);

  useEffect(() => {
    const dummyData = getDummyData(selectedSymbol);
    console.log("This is the chartData", chartData)
    setChartData(dummyData);
  }, [selectedSymbol]);

  return (
    <div className="bg-[#141619] min-h-screen">
      <div className="flex">
        <div className="m-10 h-1/2 w-3/5 p-5 rounded-md mt-5 shadow-2xl border border-gray-700">
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
            <div className="space-x-4">
              {intervals.map((intv) => (
                <button
                  key={intv}
                  onClick={() => setSelectedInterval(intv as Interval)}
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
            <div className="flex items-center justify-center h-[450px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFCC29]"></div>
              <span className="ml-3 text-[#cac6ae]">Loading chart...</span>
            </div>
          )}
          <hr className="border-1 border-gray-400 mt-1"></hr>
          <div className="flex justify-between m-4 mb-0">
            <div>
              <div>
                <PriceDisplay selectedSymbol={selectedSymbol} />
              </div>
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
