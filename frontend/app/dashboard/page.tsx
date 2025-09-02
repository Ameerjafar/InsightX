'use client';

import { useState } from "react";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";

const Dashboard = () => {
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState<number>();
  const [asset, setAsset] = useState<"BTC" | "SOL" | "ETH">("BTC");
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);

  const openOrderFetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("we cannot find the token");
      return;
    }

    const decoded = jwt.decode(token) as JwtPayload & { email: string } | null;
    if (!decoded) {
      console.log("Invalid token");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/orders/openOrder`,
        {
          email: decoded.email,
          type,
          quantity,
          asset,
          stopLoss,
          takeProfit
        }
      );
      console.log("this is your response", response.data);
      alert("Order placed successfully!");
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard - Open Order</h1>

      <div style={{ marginBottom: "10px" }}>
        <label>Type: </label>
        <select value={type} onChange={(e) => setType(e.target.value as "buy" | "sell")}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Asset: </label>
        <select value={asset} onChange={(e) => setAsset(e.target.value as "BTC" | "SOL" | "ETH")}>
          <option value="BTC">BTC</option>
          <option value="SOL">SOL</option>
          <option value="ETH">ETH</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Quantity: </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Stop Loss: </label>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Take Profit: </label>
        <input
          type="number"
          value={takeProfit}
          onChange={(e) => setTakeProfit(Number(e.target.value))}
        />
      </div>

      <button onClick={openOrderFetchData}>Open Order</button>
    </div>
  );
};

export default Dashboard;
