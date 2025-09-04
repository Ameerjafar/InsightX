import { usePricePoller } from "./hooks/usePricePoller";

export const PriceDisplay = ({ selectedSymbol }: { selectedSymbol: string }) => {
  const prices = usePricePoller();
  console.log("hello price display", prices)
  const formatPrice = (value: [number, boolean]) => value[0].toFixed(2);

  const symbol = selectedSymbol.replace("USDT", "") as "BTC" | "ETH" | "SOL";

  return (
    <div className="flex space-x-10">
      <div>
        <div className="text-sm text-gray-400 mb-1">BID (Buy)</div>
        <div
          className={`text-2xl font-bold transition-colors duration-300 ${
            prices[symbol].bid[1] ? "text-red-500" : "text-green-500"
          }`}
        >
          ${formatPrice(prices[symbol].bid)}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">ASK (Sell)</div>
        <div
          className={`text-2xl font-bold transition-colors duration-300 ${
            prices[symbol].ask[1] ? "text-red-500" : "text-green-500"
          }`}
        >
          ${formatPrice(prices[symbol].ask)}
        </div>
      </div>
    </div>
  );
};
