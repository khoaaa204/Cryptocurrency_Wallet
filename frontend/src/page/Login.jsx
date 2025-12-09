import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.message || 'Login error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-title">Đăng nhập</div>
      <form onSubmit={submit}>
        <input className="auth-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="auth-input" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="auth-btn">Đăng nhập</button>
      </form>
      <p className="auth-link">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
}
