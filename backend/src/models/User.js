import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Import thư viện mã hóa

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
    sparse: true, // QUAN TRỌNG: Cho phép nhiều người có address là null
  },
  
  // Các trường cho 2FA
  twoFactorSecret: { type: String },
  is2FAEnabled: { type: Boolean, default: false },

  // Các trường cho Reset Password
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Danh sách tài sản
  assets: [{
    symbol: String,
    name: String,
    balance: Number,
    address: String
  }]
}, { timestamps: true });

// --- MIDDLEWARE: Tự động mã hóa mật khẩu trước khi lưu ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- METHOD: Kiểm tra mật khẩu khi đăng nhập ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);