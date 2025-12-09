import React, { createContext, useContext, useEffect, useState } from "react";
import { getProvider, requestAccounts, isMetaMaskInstalled } from "../lib/provider";
import { getNonce, loginWithSignature } from "../api/authApi";
import { signMessage } from "../lib/ethersHelpers";

// Tạo context
const WalletContext = createContext(null);

// Provider
export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [token, setToken] = useState(null); // JWT từ backend
  const [user, setUser] = useState(null);

  // Khởi tạo provider và token từ localStorage
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      setProvider(getProvider());
      const saved = localStorage.getItem("cw_token");
      if (saved) setToken(saved);
    }
  }, []);

  // Lưu token vào localStorage
  useEffect(() => {
    if (token) localStorage.setItem("cw_token", token);
    else localStorage.removeItem("cw_token");
  }, [token]);

  // Kết nối ví MetaMask và login SIWE
  const connectAndLogin = async () => {
    try {
      if (!isMetaMaskInstalled()) throw new Error("MetaMask not installed");

      const accounts = await requestAccounts();
      const addr = accounts[0];
      setAddress(addr);

      const nonceResp = await getNonce(addr);
      const message = `Sign this message for ${process.env.REACT_APP_NAME || "CryptoWalletApp"} - nonce: ${nonceResp.nonce}`;

      const signature = await signMessage(message, getProvider());
      const data = await loginWithSignature(addr, signature);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error("connectAndLogin:", err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, provider, token, user, connectAndLogin, logout }}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook tiện ích để dùng context
export const useWallet = () => useContext(WalletContext);
