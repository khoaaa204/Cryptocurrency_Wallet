import React, { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";
import { getTransactions } from "../api/walletApi";

export default function WalletDashboard() {
  const { address } = useWallet();
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const data = await getTransactions(address);
        setTxs(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [address]);

  return (
    <div className="card">
      <h3>Dashboard</h3>
      <div className="small">Address: {address || "not connected"}</div>
      <div style={{ marginTop: 12 }}>
        <h4>Recent Transactions</h4>
        {txs.length === 0 ? <div className="small">No transactions found</div> : (
          <ul>
            {txs.slice(0,5).map(tx => (
              <li key={tx.hash} className="small">
                {tx.hash} — {tx.amount} {tx.token} — {new Date(tx.createdAt).toLocaleString()} — {tx.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
