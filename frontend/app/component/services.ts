import axios from "axios";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
export const fetchOpenData = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("I did not find token on the local storage");
    return;
  }

  const decodeData: any = jwt.decode(token);
  if (!decodeData || !decodeData.email) {
    console.log("Invalid token or email missing in token");
    return;
  }

  try {
    const response = await axios.get(
      `http://localhost:5000/orders/allOrders?email=r@gmail.com`
    );
    return response.data.orders || []; 
  } catch (err) {
    console.error("Error fetching open data:", err);
    toast.error("Failed to fetch open trades");
  } finally {
  }
};

export const calculateProfitLoss = (
  entry: number,
  quantity: number,
  type: "BUY" | "SELL",
  bidPrice: number,
  askPrice: number
) => {
  const entryTotalValue = entry;

  if (type === "BUY") {
    const currentValue = bidPrice * quantity;
    return currentValue - entryTotalValue;
  } else {
    const currentValue = askPrice * quantity;
    return entryTotalValue - currentValue;
  }
};
fetchOpenData();
