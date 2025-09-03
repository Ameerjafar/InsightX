import axios from "axios";
import toast from "react-hot-toast";

export const fetchOpenData = async () => {
  const email = localStorage.getItem("userEmail");
  try {
    const response = await axios.get(
      `http://localhost:5000/orders/allOrders?email=${email}`,
    );
    console.log("this is all your open trade", response.data.orders);
    return response.data.orders || []; 
  } catch (err) {
    console.error("Error fetching open data:", err);
    toast.error("Failed to fetch open trades");
    return [];
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
