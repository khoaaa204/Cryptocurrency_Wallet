import React, { useEffect, useState } from 'react';
import API from '../api/api';
import "../components/WalletDashboard"
export default function Dashboard() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/wallets');
        setWallets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      {wallets.map((w, i) => (
        <div key={w.id || i}>
          <p>{w.address}</p>
          <p>{w.balance} ETH</p>
        </div>
      ))}
    </div>
  );
}
