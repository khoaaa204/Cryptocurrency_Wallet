import React from "react";

export default function TransactionsList({ txs = [] }) {
  return (
    <div className="card">
      <h3>Transactions</h3>
      {txs.length === 0 ? <div className="small">No transactions</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="small"><th>Hash</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Time</th></tr>
          </thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx.hash} className="small">
                <td style={{ wordBreak: "break-all" }}>{tx.hash}</td>
                <td>{tx.from}</td>
                <td>{tx.to}</td>
                <td>{tx.amount} {tx.token}</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
