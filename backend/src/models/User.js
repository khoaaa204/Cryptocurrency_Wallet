// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: false }, // Địa chỉ ví chính (ETH)
  
  // --- BẢO MẬT ---
  twoFactorSecret: { type: String }, // Khóa bí mật 2FA
  is2FAEnabled: { type: Boolean, default: false }, // Trạng thái 2FA
  encryptedPrivateKey: { type: String }, // Khóa riêng tư đã mã hóa (Custodial Wallet)

  // --- QUẢN LÝ TOKEN ---
  assets: [
    {
      symbol: { type: String, required: true }, // Vd: USDT, BNB
      name: { type: String },
      balance: { type: Number, default: 0 },
      address: { type: String }, // Contract Address của Token
      network: { type: String, default: 'Ethereum' }
    }
  ]
}, { timestamps: true });

export default mongoose.model("User", userSchema);