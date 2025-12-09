import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/**
 * POST /api/wallets/transaction
 * protected route (requires JWT)
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { hash, from, to, amount, token = "ETH", status = "pending" } = req.body;
    if (!hash || !from || !to || amount == null) {
      return res.status(400).json({ error: "hash, from, to, amount required" });
    }

    const user = await User.findOne({ address: from.toLowerCase() });

    const tx = await Transaction.create({
      hash,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      amount,
      token,
      status,
      user: user ? user._id : undefined
    });

    res.status(201).json(tx);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Transaction already exists" });
    next(err);
  }
};

/**
 * GET /api/wallets/transactions/:address
 */
export const getTransactionsByAddress = async (req, res, next) => {
  try {
    const { address } = req.params;
    if (!address) return res.status(400).json({ error: "address required" });

    const txs = await Transaction.find({
      $or: [{ from: address.toLowerCase() }, { to: address.toLowerCase() }]
    })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(txs);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/wallets/me
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ id: user._id, address: user.address, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
};

// --- QUAN TRỌNG: Thêm hàm này để Dashboard lấy danh sách ví ---
export const getWallets = async (req, res, next) => {
  try {
    const user = req.user;
    // Trả về danh sách ví giả lập dựa trên user hiện tại
    // Frontend cần một mảng [], nên ta trả về mảng chứa user hiện tại
    res.json([
      {
        _id: user._id,
        address: user.address || "0x000... (Chưa kết nối ví)",
        balance: 0, // Giá trị mặc định
        token: "ETH"
      }
    ]);
  } catch (err) {
    next(err);
  }
};