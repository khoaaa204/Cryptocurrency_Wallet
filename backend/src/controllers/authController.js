import { randomBytes } from "crypto";
import { verifyMessage } from "ethers";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const APP_NAME = process.env.APP_NAME || "CryptoApp";

export const getNonce = async (req, res, next) => {
  try {
    const { address } = req.params;
    if (!address) return res.status(400).json({ error: "Address required" });

    let user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      const nonce = randomBytes(16).toString("hex");
      user = await User.create({ address: address.toLowerCase(), nonce });
    }
    return res.json({ address: user.address, nonce: user.nonce });
  } catch (err) {
    next(err);
  }
};

//Hàm Đăng Ký (Thêm mới đoạn này)
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kiểm tra user tồn tại chưa (Logic giả định)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Tạo user mới
    const user = await User.create({
      email,
      password, // Lưu ý: Trong thực tế nhớ hash password bằng bcrypt
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server khi đăng ký" });
  }
};

export const login = async (req, res, next) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) return res.status(400).json({ error: "address and signature required" });

    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) return res.status(400).json({ error: "User not found, request nonce first" });

    const message = `Sign this message for ${APP_NAME} - nonce: ${user.nonce}`;
    // recover address
    let recovered;
    try {
      recovered = verifyMessage(message, signature);
    } catch (err) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature verification failed: address mismatch" });
    }

    // regenerate nonce to prevent replay
    user.nonce = randomBytes(16).toString("hex");
    await user.save();

    const payload = { id: user._id, address: user.address };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    return res.json({ token, user: { address: user.address, id: user._id } });
  } catch (err) {
    next(err);
  }
};
