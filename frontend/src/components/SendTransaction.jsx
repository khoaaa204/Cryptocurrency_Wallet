import React, { useState } from "react";
import useWallet from "../hooks/useWallet";
import { saveTransaction } from "../api/walletApi";
import { ethers } from "ethers";

export default function SendTransaction() {
  const { provider, address, token } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const send = async () => {
    if (!provider) return toast.success("Connect MetaMask first");
    try {
      setLoading(true);
      setMsg(null);
      const signer = await provider.getSigner();
      const value = ethers.parseEther(String(amount || "0"));
      const txResp = await signer.sendTransaction({ to, value });
      // txResp.hash exists
      setMsg(`Transaction sent: ${txResp.hash}`);

      // save to backend if token present
      if (token) {
        await saveTransaction(token, {
          hash: txResp.hash,
          from: address,
          to,
          amount: Number(amount),
          token: "ETH",
          status: "pending"
        });
      }
      setTo("");
      setAmount("");
    } catch (err) {
      console.error(err);
      setMsg("Error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Send Transaction</h3>
      <div className="flex">
        <input className="input" placeholder="To address" value={to} onChange={(e)=>setTo(e.target.value)} />
        <input className="input" placeholder="Amount (ETH)" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <button className="btn" onClick={send} disabled={loading}>{loading ? "Sending..." : "Send"}</button>
      </div>
      {msg && <div className="small" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
