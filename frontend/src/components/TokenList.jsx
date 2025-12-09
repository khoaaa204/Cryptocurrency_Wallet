import React from "react";

export default function TokenList({ tokens = [] }) {
  return (
    <div className="card">
      <h3>Tokens</h3>
      {tokens.length === 0 ? <div className="small">No token data</div> : (
        <ul>
          {tokens.map(t => (
            <li key={t.symbol} className="small">{t.symbol} — {t.balance} — ${t.price}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
