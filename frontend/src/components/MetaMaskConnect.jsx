import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

/**
 * MetaMaskConnect
 * - Kết nối MetaMask
 * - Hiển thị account, chainId, balance
 * - Lắng nghe account/chain thay đổi
 * - signMessage ví dụ
 *
 * Props:
 * - onConnected(account: string | null) => void
 */
export default function MetaMaskConnect(props) {
  const [available, setAvailable] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setAvailable(true);
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);

      // nếu đã có account được kết nối trước đó, lấy nó (không show popup)
      (async () => {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length) {
            handleAccountSet(accounts[0], p);
          }
          if (window.ethereum.chainId) setChainId(window.ethereum.chainId);
        } catch (e) {
          // ignore
        }
      })();

      // listeners
      const handleAccounts = (accounts) => {
        const acc = accounts && accounts.length ? accounts[0] : null;
        handleAccountSet(acc, p);
      };
      const handleChain = (chain) => {
        setChainId(chain);
      };

      window.ethereum.on && window.ethereum.on("accountsChanged", handleAccounts);
      window.ethereum.on && window.ethereum.on("chainChanged", handleChain);

      return () => {
        window.ethereum.removeListener && window.ethereum.removeListener("accountsChanged", handleAccounts);
        window.ethereum.removeListener && window.ethereum.removeListener("chainChanged", handleChain);
      };
    } else {
      setAvailable(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi account được set (kể cả khi thay đổi), cập nhật state app + balance
  async function handleAccountSet(acc, p) {
    setAccount(acc);
    // thông báo cho App.jsx (nếu có callback)
    if (props && typeof props.onConnected === "function") {
      props.onConnected(acc);
    }
    if (!acc) {
      setBalance(null);
      return;
    }
    try {
      const providerToUse = p || provider || new ethers.BrowserProvider(window.ethereum);
      const signer = await providerToUse.getSigner();
      const bal = await signer.getBalance();
      setBalance(ethers.formatEther(bal));
    } catch (e) {
      console.error("handleAccountSet balance error", e);
      setBalance(null);
    }
  }

  async function updateBalance(p, address) {
    try {
      const providerToUse = p || provider || new ethers.BrowserProvider(window.ethereum);
      const signer = await providerToUse.getSigner();
      const bal = await signer.getBalance();
      setBalance(ethers.formatEther(bal));
    } catch (e) {
      console.error("updateBalance error", e);
      setBalance(null);
    }
  }

  async function connect() {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask không được tìm thấy. Vui lòng cài MetaMask extension.");
      return;
    }
    try {
      // yêu cầu kết nối (MetaMask popup)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0];

      // đảm bảo provider dùng ngay (không dùng stale provider state)
      const p = provider || new ethers.BrowserProvider(window.ethereum);
      setProvider(p);

      await handleAccountSet(acc, p);
      setChainId(window.ethereum.chainId || null);
    } catch (err) {
      console.error(err);
      // người dùng bấm cancel hoặc lỗi khác
      setError(err?.message || "Kết nối thất bại");
    }
  }

  async function disconnectLocal() {
    // MetaMask không hỗ trợ programmatic disconnect từ dapp.
    // Ta chỉ clear state local để UX giống disconnect.
    setAccount(null);
    setBalance(null);
    setChainId(null);
    if (props && typeof props.onConnected === "function") {
      props.onConnected(null);
    }
  }

  async function signExample() {
    if (!provider || !account) {
      setError("Cần kết nối trước khi sign");
      return;
    }
    try {
      const signer = await provider.getSigner();
      const message = `Xin chào — ký lúc ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);
      alert("Signature:\n" + signature);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Sign thất bại");
    }
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, maxWidth: 520 }}>
      <h3>MetaMask Connect</h3>
      {!available && <p>MetaMask không được tìm thấy. Cài MetaMask rồi thử lại.</p>}
      {available && !account && <button onClick={connect}>Kết nối MetaMask</button>}
      {account && (
        <div>
          <p><strong>Account:</strong> {account}</p>
          <p><strong>ChainId:</strong> {chainId}</p>
          <p><strong>Balance:</strong> {balance ? `${balance} ETH` : "đang tải..."}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={signExample}>Sign example</button>
            <button onClick={disconnectLocal}>Disconnect (local)</button>
          </div>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <small style={{ display: "block", marginTop: 8 }}>
        Ghi chú: MetaMask quản lý kết nối. "Disconnect" ở đây chỉ xóa trạng thái local trong app.
      </small>
    </div>
  );
}
