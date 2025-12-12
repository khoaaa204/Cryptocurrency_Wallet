import express from "express";
// Import đủ các hàm từ controller (bao gồm updateWalletAddress)
import { 
  getContacts, 
  addContact, 
  deleteContact, 
  updateWalletAddress // <--- QUAN TRỌNG: Phải import hàm này
} from "../controllers/userController.js";

const router = express.Router();

// Các route Danh bạ (Đã có)
router.get("/contacts", getContacts);
router.post("/contacts", addContact);
router.post("/contacts/delete", deleteContact);

// --- ROUTE CẬP NHẬT VÍ (CÁI BẠN ĐANG THIẾU) ---
router.put("/update-wallet", updateWalletAddress); 
// ---------------------------------------------

export default router;