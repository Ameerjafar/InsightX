import { useState, useEffect, useRef } from "react";

interface PricePollerObject {
  selectedSymbol: string;
}

export const PricePoller = ({ selectedSymbol }: PricePollerObject) => {
  const [btcValue, setBtcValue] = useState<[number, boolean]>([0, false]);
  const [ethValue, setEthValue] = useState<[number, boolean]>([0, false]);
  const [solValue, setSolValue] = useState<[number, boolean]>([0, false]);

  const [sellBtcValue, setSellBtcValue] = useState<[number, boolean]>([0, false]);
  const [sellEthValue, setSellEthValue] = useState<[number, boolean]>([0, false]);
  const [sellSolValue, setSellSolValue] = useState<[number, boolean]>([0, false]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Browser connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
      
      // Check for bookTicker data (updated from backend)
      if (data.type === "bookTicker") {
        const symbol = data.data.symbol;
        const bookTicker = data.data.bookTicker;
        
        console.log("Symbol:", symbol);
        console.log("BookTicker data:", bookTicker);
        console.log("Bid Price:", bookTicker.bidPrice, "Ask Price:", bookTicker.askPrice);

        if (symbol === 'BTC') {
          console.log("Processing BTC data");
          // Update bid price (buy price for user)
          setBtcValue((prev) => {
            const currentPrice = bookTicker.bidPrice;
            console.log("BTC bid price:", currentPrice);
            const isFalling = prev[0] > currentPrice;
            return [currentPrice, isFalling];
          });
          
          // Update ask price (sell price for user)  
          setSellBtcValue((prev) => {
            const currentPrice = bookTicker.askPrice;
            console.log("BTC ask price:", currentPrice);
            const isFalling = prev[0] > currentPrice;
            return [currentPrice, isFalling];
          });
          
        } else if (symbol === 'ETH') {
          setEthValue((prev) => {
            const currentPrice = bookTicker.bidPrice;
            console.log("ETH bid price:", currentPrice);
            const isFalling = prev[0] > currentPrice;
            return [currentPrice, isFalling];
          });
          
          setSellEthValue((prev) => {
            const currentPrice = bookTicker.askPrice;
            const isFalling = prev[0] > currentPrice;
            return [currentPrice, isFalling];
          });
          
        } else if (symbol === 'SOL') {
          setSolValue((prev) => {
            const currentPrice = bookTicker.bidPrice;
            const isFalling = prev[0] > currentPrice;
            return [currentPrice, isFalling];
          });
          
          setSellSolValue((prev) => {
            const currentPrice = bookTicker.askPrice;
            const isFalling = prev[0] > currentPrice;
            return [currentPrice, isFalling];
          });
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Helper function to format price display
  const formatPrice = (value: [number, boolean]) => {
    return value[0].toFixed(2);
  };

  return (
    <div className="flex space-x-3">
      {/* Bid Prices (Buy Prices) */}
      <div className="ml-6">
        <div className="text-sm text-gray-400 mb-1">BID (Buy)</div>
        {selectedSymbol === "BTCUSDT" ? (
          <div className={`text-2xl font-bold animate-pulse transition-colors duration-300 ${
            btcValue[1] ? 'text-red-500' : 'text-green-500'
          }`}>
            ${formatPrice(btcValue)}
          </div>
        ) : selectedSymbol === "ETHUSDT" ? (
          <div className={`text-2xl font-bold animate-pulse transition-colors duration-300 ${
            ethValue[1] ? 'text-red-500' : 'text-green-500'
          }`}>
            ${formatPrice(ethValue)}
          </div>
        ) : (
          <div className={`text-2xl font-bold animate-pulse transition-colors duration-300 ${
            solValue[1] ? 'text-red-500' : 'text-green-500'
          }`}>
            ${formatPrice(solValue)}
          </div>
        )}
      </div>

      {/* Ask Prices (Sell Prices) */}
      <div className="ml-20">
        <div className="text-sm text-gray-400 mb-1">ASK (Sell)</div>
        {selectedSymbol === "BTCUSDT" ? (
          <div className={`text-2xl font-bold animate-pulse transition-colors duration-300 ${
            sellBtcValue[1] ? 'text-red-500' : 'text-green-500'
          }`}>
            ${formatPrice(sellBtcValue)}
          </div>
        ) : selectedSymbol === "ETHUSDT" ? (
          <div className={`text-2xl font-bold animate-pulse transition-colors duration-300 ${
            sellEthValue[1] ? 'text-red-500' : 'text-green-500'
          }`}>
            ${formatPrice(sellEthValue)}
          </div>
        ) : (
          <div className={`text-2xl font-bold animate-pulse transition-colors duration-300 ${
            sellSolValue[1] ? 'text-red-500' : 'text-green-500'
          }`}>
            ${formatPrice(sellSolValue)}
          </div>
        )}
      </div>
    </div>
  );
};