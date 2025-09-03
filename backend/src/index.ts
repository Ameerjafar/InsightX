import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/ordersRoutes.js";
import cors from 'cors';
import candleRoutes from "./routes/candelsRoutes.js";

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

