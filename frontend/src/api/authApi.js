import axios from "axios";
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE + "/auth" });

export const getNonce = async (address) => {
  const res = await API.get(`/nonce/${address}`);
  return res.data;
};

export const loginWithSignature = async (address, signature) => {
  const res = await API.post("/login", { address, signature });
  return res.data; // { token, user }
};
