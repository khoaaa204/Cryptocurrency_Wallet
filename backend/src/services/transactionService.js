import Transaction from "../models/Transaction.js";

export const listTransactionsForAddress = async (address, limit = 200) => {
  return Transaction.find({
    $or: [{ from: address.toLowerCase() }, { to: address.toLowerCase() }]
  }).sort({ createdAt: -1 }).limit(limit);
};

export const saveTransaction = async (txObj) => {
  return Transaction.create(txObj);
};
