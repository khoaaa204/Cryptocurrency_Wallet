import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
})();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// --- SỬA DÒNG DƯỚI ĐÂY ---
// Đổi "wallet" thành "wallets" (thêm s) để khớp với Frontend
app.use("/api/wallets", walletRoutes); 
// -------------------------

app.get("/", (req, res) =>
  res.json({
    status: "ok",
    app: process.env.APP_NAME || "CryptoWalletBackend",
  })
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});