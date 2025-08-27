"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Candle = {
  x: Date;
  y: number[];
};

const intervals = ["1m", "5m", "1h", "1d"];

export default function CandlestickChart() {
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("1m");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("Connected to WebSocket server ✅");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "klines" && msg.data[selectedSymbol]) {
        const klines = msg.data[selectedSymbol][selectedInterval]; // all 1-min candles
        const formatted: Candle[] = klines.map((kline) => ({
          x: new Date(kline[0]), // timestamp in ms
          y: [
            parseFloat(kline[1]),
            parseFloat(kline[2]),
            parseFloat(kline[3]),
            parseFloat(kline[4]),
          ],
        }));
        setChartData(formatted);
        setChartData(formatted);
      }
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server ❌");

    return () => ws.close();
  }, [selectedSymbol, selectedInterval]);

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      height: 350,
      animations: { enabled: true },
    },
    title: {
      text: `${selectedSymbol} (${selectedInterval}) Candlestick Chart`,
      align: "left",
    },
    xaxis: { type: "datetime" },
    yaxis: { tooltip: { enabled: true } },
  };

  return (
    <div className="space-y-6">
      {/* Symbol buttons */}
      <div className="flex gap-4">
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
      </div>
      <div className="flex gap-4">
        {intervals.map((intv) => (
          <button
            key={intv}
            onClick={() => setSelectedInterval(intv)}
            className={`px-4 py-2 rounded ${
              selectedInterval === intv
                ? "bg-green-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {intv}
          </button>
        ))}
      </div>
      {chartData.length > 0 ? (
        <Chart
          options={options}
          series={[{ data: chartData }]}
          type="candlestick"
          height={350}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
}
