import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // <--- QUAN TRỌNG: Phải import thư viện này

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' // Mặc định ai đăng ký cũng chỉ là user thường
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
    sparse: true, // Cho phép nhiều user có address là null
  },
  
  // --- CÁC TRƯỜNG CHO 2FA ---
  twoFactorSecret: { type: String },
  is2FAEnabled: { type: Boolean, default: false },

  // --- CÁC TRƯỜNG CHO QUÊN MẬT KHẨU ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // --- DANH SÁCH TÀI SẢN ---
  assets: [{
    symbol: String,
    name: String,
    balance: Number,
    address: String
  }],
  contacts: [
    {
      name: { type: String, required: true }, // Tên gợi nhớ (VD: Anh Nam)
      address: { type: String, required: true } // Địa chỉ ví (0x...)
    }
  ]
}, { timestamps: true });

// 1. MIDDLEWARE: Tự động mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. METHOD: Kiểm tra mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. METHOD: Tạo Token khôi phục mật khẩu (Cái bạn đang thiếu)
userSchema.methods.getResetPasswordToken = function () {
  // Tạo chuỗi ngẫu nhiên
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Mã hóa token và lưu vào Database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token hết hạn sau 10 phút
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Trả về token thô để gửi qua email
};

export default mongoose.model("User", userSchema);