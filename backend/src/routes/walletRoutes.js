import express from "express";
// Import thêm hàm getWallets (chúng ta sẽ tạo ở bước 2)
import { createTransaction, getTransactionsByAddress, getProfile, getWallets } from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- THÊM DÒNG NÀY ĐỂ SỬA LỖI 404 DASHBOARD ---
// Đường dẫn này ứng với: GET /api/wallets
router.get("/", protect, getWallets); 
// ----------------------------------------------

// lưu tx (được bảo vệ — yêu cầu JWT)
router.post("/transaction", protect, createTransaction);

// lấy tx theo address (công khai)
router.get("/transactions/:address", getTransactionsByAddress);

// optional: profile of logged in user
router.get("/me", protect, getProfile);

export default router;