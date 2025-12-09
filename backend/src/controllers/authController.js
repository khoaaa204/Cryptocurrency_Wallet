import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";

// 1. Tạo mã QR để User quét (Setup 2FA)
export const setup2FA = async (req, res) => {
  try {
    const { userId } = req.body; // Lấy từ Token hoặc gửi lên
    
    // Tạo secret ngẫu nhiên
    const secret = speakeasy.generateSecret({ name: "CryptoWalletApp" });
    
    // Lưu tạm vào DB (chưa bật hẳn, đợi user verify)
    await User.findByIdAndUpdate(userId, { twoFactorSecret: secret.base32 });

    // Tạo mã QR
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ message: "Lỗi tạo QR" });
      
      // Trả về ảnh QR và secret dạng text
      res.json({ qrCode: data_url, secret: secret.base32 });
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 2. Xác thực mã 6 số User nhập vào để BẬT 2FA
export const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body; // token là mã 6 số từ Google Authenticator
    const user = await User.findById(userId);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
    });

    if (verified) {
      user.is2FAEnabled = true;
      await user.save();
      res.json({ message: "Bảo mật 2 lớp đã được bật thành công!" });
    } else {
      res.status(400).json({ message: "Mã xác thực không đúng!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};