import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from "./routes/userRoutes.js";
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
app.use('/api/admin', adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes); 
app.use("/api/user", userRoutes); 
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