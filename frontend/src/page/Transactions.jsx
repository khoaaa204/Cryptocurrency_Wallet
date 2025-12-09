import React, { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";
import { getTransactions } from "../api/walletApi";
import TransactionsList from "../components/TransactionsList";

export default function Transactions() {
  const { address } = useWallet();
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    (async () => {
      if (!address) return;
      try {
        const data = await getTransactions(address);
        setTxs(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [address]);

  return (
    <div>
      <h2>Transactions</h2>
      {!address ? <div className="card small">Connect wallet to see transactions</div> : <TransactionsList txs={txs} />}
    </div>
  );
}
