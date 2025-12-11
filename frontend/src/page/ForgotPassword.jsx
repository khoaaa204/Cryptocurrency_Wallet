import React, { useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';
import '../Auth.css'; // Dùng chung style với Login

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await API.post('/auth/forgotpassword', { email });
      setMessage(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-title">Quên Mật Khẩu</div>
      <p style={{textAlign: 'center', marginBottom: 20, color: '#666'}}>
        Nhập email của bạn, chúng tôi sẽ gửi link khôi phục.
      </p>
      
      {message && <div style={{background: '#d1fae5', color:'#065f46', padding: 10, borderRadius: 5, marginBottom: 15}}>{message}</div>}
      {error && <div style={{background: '#fee2e2', color:'#b91c1c', padding: 10, borderRadius: 5, marginBottom: 15}}>{error}</div>}

      <form onSubmit={submit}>
        <input 
          className="auth-input" 
          type="email" 
          required
          placeholder="Nhập Email đăng ký" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <button className="auth-btn" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi Link Khôi Phục"}
        </button>
      </form>
      
      <p className="auth-link">
        <Link to="/login">← Quay lại Đăng nhập</Link>
      </p>
    </div>
  );
}