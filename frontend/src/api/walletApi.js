import axios from "axios";
const base = import.meta.env.VITE_API_BASE + "/wallet";

export const saveTransaction = async (token, tx) => {
  const res = await axios.post(`${base}/transaction`, tx, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getTransactions = async (address) => {
  const res = await axios.get(`${base}/transactions/${address}`);
  return res.data;
};

export const getProfile = async (token) => {
  const res = await axios.get(`${base}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
