import { ethers } from "ethers";

export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && !!window.ethereum;
};

export const getProvider = () => {
  if (!isMetaMaskInstalled()) return null;
  return new ethers.BrowserProvider(window.ethereum);
};

export const requestAccounts = async () => {
  if (!isMetaMaskInstalled()) throw new Error("MetaMask not found");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts;
};
