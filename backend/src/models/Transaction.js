import mongoose from "mongoose";

const txSchema = new mongoose.Schema(
  {
    hash: { type: String, required: true, unique: true, trim: true },
    from: { type: String, required: true, lowercase: true, trim: true },
    to: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: Number, required: true },
    token: { type: String, default: "ETH", trim: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", txSchema);
export default Transaction;
