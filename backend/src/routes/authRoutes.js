import express from "express";
// Import đủ các hàm đã export bên controller
import { getNonce, login, register, setup2FA, verify2FA,forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// --- AUTH CƠ BẢN ---
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
// --- WEB3 AUTH ---
router.get("/nonce/:address", getNonce);

// --- 2FA (BẢO MẬT 2 LỚP) ---
router.post("/2fa/setup", setup2FA);   // API tạo mã QR
router.post("/2fa/verify", verify2FA); // API xác nhận mã 6 số

export default router;