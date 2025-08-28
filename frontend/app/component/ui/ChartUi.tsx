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

export default function ChartUi() {
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState<Interval>("1m");
  // const [cryptoDetail, setCryptoDetail] = useState();
  const [btcValue, setBtcValue] = useState<[number, boolean]>([0, false]);
  const [solValue, setSolValue] = useState<[number, boolean]>([0, false]);
  const [ethValue, setEthValue] = useState<[number, boolean]>([0, false]);
  type Interval = "1m" | "2m" | "5m" | "1h" | "1d";

  const intervalMsMap: Record<Interval, number> = {
    "1m": 60_000,
    "2m": 120_000,
    "5m": 300_000,
    "1h": 3_600_000,
    "1d": 86_400_000,
  };
  function getCandleStart(ts: number, interval: Interval) {
    const intervalMs = intervalMsMap[interval];
    return Math.floor(ts / intervalMs) * intervalMs;
  }
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("Connected to WebSocket server ✅");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(msg);
      if (msg.type === "price_update") {
        const klines = msg.data[selectedSymbol];
        console.log(klines);
        console.log(btcValue);
        klines.forEach((kline: any) => {
          if (selectedSymbol === "BTCUSDT") {
            setBtcValue((prev) => {
              const currentPrice = parseFloat(kline[2]);
              const isFalling = prev[0] > currentPrice;

              console.log("Previous price:", prev[0]);
              console.log("Current price:", currentPrice);
              console.log("Is price falling?", isFalling);

              return [currentPrice, isFalling];
            });
          } else if (selectedSymbol === "ETHUSDT") {
            setEthValue((prev) => [
              parseFloat(kline[2]),
              prev[0] > parseFloat(kline[2]),
            ]);
          } else {
            setSolValue((prev) => [
              parseFloat(kline[2]),
              prev[0] > parseFloat(kline[2]),
            ]);
          }
        });
      }
      if (msg.type === "klines" && msg.data[selectedSymbol]) {
        const klines = msg.data[selectedSymbol][selectedInterval];
        // console.log(new Date(getCandleStart(klines[1][0], selectedInterval)).toUTCString());
        const formatted: Candle[] = klines.map((kline) => ({
          x: new Date(kline[0]),
          y: [
            parseFloat(kline[1]),
            parseFloat(kline[2]),
            parseFloat(kline[3]),
            parseFloat(kline[4]),
          ],
        }));
        setChartData(formatted);
      }
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server ❌");

    return () => ws.close();
  }, [selectedSymbol, selectedInterval]);

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

  return (
    <div className="bg-[#141619] min-h-screen">
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
                onClick={() => setSelectedInterval(intv)}
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
        <hr className = 'border-1 border-gray-400 mt-1'></hr>
        <div className = 'flex justify-between m-4 mb-0'>
          <div>
            <div className = 'text-white text-lg font-semibold'>Current Price</div>
            <div className = 'text-2xl font-bold text-white'>10.2345</div>
          </div>
          <div className = 'flex space-x-3'>
            <button className = 'bg-green-500 hover:bg-green-700 text-white p-3 rounded-md w-20'>Buy</button>
            <button className = 'bg-red-500 hover:bg-red-700 text-white p-3 rounded-md w-20'>Sell</button>
          </div>
        </div>
      </div>
    </div>
  );
}
