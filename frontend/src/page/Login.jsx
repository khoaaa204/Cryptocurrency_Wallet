import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Auth.css';

// Đảm bảo bạn đã có ảnh trong assets
import bgImage from '../assets/bg-crypto.jpg'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success("Đăng nhập thành công");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      
      {/* 1. CỘT TRÁI (HÌNH ẢNH) */}
      <div 
        className="auth-image-side" 
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Có thể thêm text đè lên ảnh nếu muốn, hoặc để trống như MB */}
      </div>

      {/* 2. CỘT PHẢI (FORM) */}
      <div className="auth-form-side">
        
        {/* Hotline góc trên */}
        <div className="top-header">
          📞 Hotline: <span style={{fontWeight:'bold'}}>+84377605133</span> (VN)
        </div>

        <div className="auth-container">
          
          {/* Logo & Tiêu đề */}
          <div className="auth-branding">
            <span className="logo-text">Crypto Wallet</span>
            <div className="welcome-text">Chào mừng bạn đến với</div>
            <div className="app-name">Ví Điện Tử Internet Banking</div>
          </div>

          <form onSubmit={submit}>
            {/* Input Email */}
            <label className="input-label">Tên đăng nhập / Email</label>
            <input 
              className="auth-input" 
              type="email" 
              required 
              placeholder="Nhập email của bạn" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            
            {/* Input Password */}
            <label className="input-label">Mật khẩu</label>
            <input 
              className="auth-input" 
              type="password" 
              required 
              placeholder="Nhập mật khẩu" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="auth-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            {/* Links bên dưới nút */}
            <div className="auth-actions">
              <Link to="/forgot-password" class="link-blue">Quên mật khẩu?</Link>
              <Link to="/register" class="link-blue">Bạn Chưa Có Tài Khoản?</Link>
            </div>
          </form>

        </div>

        {/* Footer Links (Dưới cùng) */}
        <div className="auth-footer">
          <a href="#">Kết nối với chúng tôi</a> |
          <a href="#">Điều khoản điều kiện</a> |
          <a href="#">An toàn bảo mật</a>
        </div>

      </div>
    </div>
  );
}