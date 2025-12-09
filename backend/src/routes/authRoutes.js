import express from "express";
// Import thêm hàm register (nhớ cập nhật ở controller bước 2)
import { getNonce, login, register } from "../controllers/authController.js";


const router = express.Router();

// --- AUTH TRUYỀN THỐNG (Email/Pass) ---
// Route này để sửa lỗi 404 bạn đang gặp
router.post("/register", register); 


// --- AUTH WEB3 (MetaMask) ---
// lấy nonce: frontend gọi trước khi yêu cầu sign
router.get("/nonce/:address", getNonce);

// gửi chữ ký để đăng nhập
router.post("/login", login);

export default router;