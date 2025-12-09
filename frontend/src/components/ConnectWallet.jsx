import React from "react";
import useWallet from "../hooks/useWallet";

export default function ConnectWallet() {
  const { address, token, connectAndLogin, logout } = useWallet();

  return (
    <div className="card">
      <h3>Wallet</h3>
      {address ? (
        <div>
          <div className="small">Connected: {address}</div>
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={logout}>Disconnect</button>
            {token ? <span style={{ marginLeft: 12 }} className="small">Authenticated</span> : <span style={{ marginLeft: 12 }} className="small">Not authenticated</span>}
          </div>
        </div>
      ) : (
        <div>
          <p className="small">Please connect MetaMask.</p>
          <button className="btn" onClick={connectAndLogin}>Connect & Sign-in</button>
        </div>
      )}
    </div>
  );
}
