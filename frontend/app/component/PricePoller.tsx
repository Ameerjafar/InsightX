import { useState } from "react";

interface PricePollerObject {
  selectedSymbol: string;
  //   setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
}
export const PricePoller = ({ selectedSymbol }: PricePollerObject) => {
  const [btcValue, setBtcValue] = useState<[number, boolean]>([0, false]);
  const [ethValue, setEthValue] = useState<[number, boolean]>([0, false]);
  const [solValue, setSolValue] = useState<[number, boolean]>([0, false]);

  const ws = new WebSocket("ws://localhost:8080");
  ws.onopen = () => console.log("browser  connected the websocket connection");
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.type === "pricePoller") {
      const price = data.data;
      console.log("This is the price", price.data.p)
      console.log(price.stream.includes(selectedSymbol.toLowerCase()));
      if (price.stream.includes("btcusdt")) {
        setBtcValue((prev) => {
            const currentPrice = parseFloat(price.data.p)
            const isFalling = prev[0] > currentPrice; 
            return [currentPrice, isFalling]; 
        });
      } else if (price.stream.includes("ethusdt")) {
        setEthValue((prev) => {
            console.log(price.p);
            const currentPrice = parseFloat(price.data.p); 
            const isFalling = prev[0] > currentPrice; 
            return [currentPrice, isFalling]; 
        });
      } else {
        setSolValue((prev) => {

            const currentPrice = parseFloat(price.p)
            const isFalling = prev[0] > currentPrice; 
            return [currentPrice, isFalling]; 
        });
      }
    }
  };
  return (
    <div>
      {selectedSymbol === "BTCUSDT" ? (
        <div className={`text-2xl font-bold text-white animate ${btcValue[1] ? `bg-green-600` : `bg-red-600`}`}>{btcValue}</div>
      ) : selectedSymbol === "ETHUSDT" ? (
        <div className="text-2xl font-bold text-white animate-blink">{ethValue}</div>
      ) : (
        <div className="text-2xl font-bold text-white animate-blink">{solValue}</div>
      )}
    </div>
  );
};
