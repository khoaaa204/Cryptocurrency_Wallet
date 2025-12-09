import React, { useState } from 'react';
import API from '../api/api';

export default function Send() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/tx/send', { to, amount }); // hoặc {to, value:amount} nếu backend yêu cầu
      alert('Tx: ' + res.data.txHash);
    } catch (err) {
      alert(err?.response?.data?.message || 'Send error');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '20px auto' }}>
      <h2>Gửi ETH</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Địa chỉ nhận"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          placeholder="Số ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button>Gửi</button>
      </form>
    </div>
  );
}
