import User from "../models/User.js";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Helper: Tạo Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_key_demo", {
    expiresIn: "30d",
  });
};

// 1. ĐĂNG KÝ
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo user (Password sẽ tự động được mã hóa nhờ pre-save hook trong Model)
    const user = await User.create({
      email,
      password,
      is2FAEnabled: false
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      token: generateToken(user._id),
      user: { _id: user._id, email: user.email, address: user.address, is2FAEnabled: false },
    });
  } catch (error) {
    console.error("Lỗi Đăng Ký:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// 2. ĐĂNG NHẬP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Sử dụng hàm matchPassword đã viết trong Model
    if (user && (await user.matchPassword(password))) {
      res.json({
        message: "Login thành công",
        token: generateToken(user._id),
        user: { 
          _id: user._id, 
          email: user.email, 
          address: user.address,
          is2FAEnabled: user.is2FAEnabled,
          role: user.role
        },
      });
    } else {
      res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 3. LẤY NONCE (Hỗ trợ đăng nhập MetaMask)
export const getNonce = async (req, res) => {
  try {
    const nonce = Math.floor(Math.random() * 1000000);
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tạo nonce" });
  }
};

// 4. SETUP 2FA (Tạo secret + QR)
export const setup2FA = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const secret = speakeasy.generateSecret({ name: "CryptoWalletApp" });

    // Lưu secret vào DB
    await User.findByIdAndUpdate(userId, { twoFactorSecret: secret.base32 });

    // Tạo QR Code
    const data_url = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ qrCode: data_url, secret: secret.base32 });
  } catch (error) {
    console.error("Lỗi Setup 2FA:", error);
    res.status(500).json({ message: "Lỗi Server Setup 2FA" });
  }
};

// 5. VERIFY 2FA (Xác thực mã để bật 2FA)
export const verify2FA = async (req, res) => {
  try {
    console.log("--- BẮT ĐẦU DEBUG 2FA ---");
    const { userId, token } = req.body;
    console.log("1. Nhận được Token:", token);
    console.log("2. User ID:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ Không tìm thấy User trong DB");
      return res.status(404).json({ message: "User không tồn tại" });
    }

    console.log("3. Secret trong DB:", user.twoFactorSecret); 

    if (!user.twoFactorSecret) {
      console.log("❌ LỖI: User chưa có Secret Key. Có thể lỗi ở bước Setup!");
      return res.status(400).json({ message: "Chưa thiết lập 2FA (Secret null)" });
    }

    // Thử tính toán token dự kiến (Server expected)
    const expectedToken = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: "base32"
    });
    console.log("4. Server đang mong đợi mã:", expectedToken);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 6 
    });

    console.log("5. Kết quả verify:", verified);

    if (verified) {
      user.is2FAEnabled = true;
      await user.save();
      res.json({ message: "Thành công!" });
    } else {
      res.status(400).json({ message: "Mã xác thực sai!" });
    }
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: "Lỗi Server Verify 2FA" });
  }
};

// 6. QUÊN MẬT KHẨU (Gửi email)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Thiếu email" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy Email này trong hệ thống" });

    // Lấy token reset từ Model
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Tạo link reset
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `
      <h1>Bạn đã yêu cầu đặt lại mật khẩu</h1>
      <p>Vui lòng bấm vào link bên dưới để đặt mật khẩu mới:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>Link này sẽ hết hạn sau 10 phút.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Khôi phục mật khẩu Crypto Wallet",
        message,
      });

      res.status(200).json({ success: true, data: "Email đã được gửi!" });
    } catch (err) {
      console.error("Lỗi gửi email:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Không thể gửi email, vui lòng thử lại." });
    }
  } catch (error) {
    console.error("Lỗi forgotPassword:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 7. ĐẶT LẠI MẬT KHẨU (Reset Password)
export const resetPassword = async (req, res) => {
  try {
    // Hash token từ URL để so sánh với DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (!req.body.password)
      return res.status(400).json({ message: "Thiếu mật khẩu mới" });

    // Cập nhật mật khẩu mới (KHÔNG CẦN HASH THỦ CÔNG)
    // Vì Model đã có pre('save') hook để tự động hash khi password thay đổi
    user.password = req.body.password;
    
    // Xóa token reset
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Mật khẩu đã được cập nhật thành công!" });
  } catch (error) {
    console.error("Lỗi resetPassword:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};