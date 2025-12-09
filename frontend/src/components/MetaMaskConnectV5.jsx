import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function MetaMaskConnectV5() {
  const [available, setAvailable] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      setAvailable(true);
      const p = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(p);

      const handleAccounts = (accounts) => {
        setAccount(accounts && accounts.length ? accounts[0] : null);
        if (accounts && accounts.length) updateBalance(p, accounts[0]);
      };
      const handleChain = (chain) => setChainId(chain);

      window.ethereum.on && window.ethereum.on("accountsChanged", handleAccounts);
      window.ethereum.on && window.ethereum.on("chainChanged", handleChain);

      return () => {
        window.ethereum.removeListener && window.ethereum.removeListener("accountsChanged", handleAccounts);
        window.ethereum.removeListener && window.ethereum.removeListener("chainChanged", handleChain);
      };
    } else {
      setAvailable(false);
    }
  }, []);

  async function updateBalance(p, address) {
    try {
      const bal = await p.getBalance(address);
      setBalance(ethers.utils.formatEther(bal));
    } catch (e) {
      console.error(e);
      setBalance(null);
    }
  }

  async function connect() {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask không được tìm thấy.");
      return;
    }
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      const bal = await provider.getBalance(addr);
      setBalance(ethers.utils.formatEther(bal));
      setChainId(window.ethereum.chainId || null);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Kết nối thất bại");
    }
  }

  async function signExample() {
    if (!provider) return setError("Cần kết nối");
    try {
      const signer = provider.getSigner();
      const message = `Hello — signed at ${new Date().toISOString()}`;
      const sig = await signer.signMessage(message);
      alert(sig);
    } catch (e) {
      setError(e?.message || "Sign thất bại");
    }
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>MetaMask Connect (ethers v5)</h3>
      {!available && <p>MetaMask chưa cài.</p>}
      {available && !account && <button onClick={connect}>Kết nối MetaMask</button>}
      {account && (
        <div>
          <p>Account: {account}</p>
          <p>Chain: {chainId}</p>
          <p>Balance: {balance} ETH</p>
          <button onClick={signExample}>Sign example</button>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
