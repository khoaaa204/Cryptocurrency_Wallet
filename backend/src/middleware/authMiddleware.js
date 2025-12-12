import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-nonce");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalid or expired" });
  }
};
// 2. Kiểm tra có phải Admin không (Middleware mới)
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Cho qua
  } else {
    res.status(403).json({ message: "Truy cập bị từ chối! Chỉ Admin mới được vào." });
  }
};