import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/ordersRoutes.js";
import cors from 'cors';
import candleRoutes from "./routes/candelsRoutes.js";
import "./pricePoller/pricePoller.js"; // Start the price poller

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/orders", orderRoutes)
app.use('/candles', candleRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server gracefully...');
  process.exit(0);
});
