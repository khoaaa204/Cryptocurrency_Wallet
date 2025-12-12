import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Auth.css';
import bgImage from '../assets/bg-crypto.jpg'; // Dùng chung ảnh

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', { email, password });
      toast.success("🎉 Đăng ký thành công! Hãy đăng nhập.");
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      
      {/* CỘT TRÁI */}
      <div 
        className="auth-image-side" 
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="auth-image-overlay">
          <h1>Tham gia ngay</h1>
          <p>Tạo ví CryptoWallet miễn phí chỉ trong 30 giây.</p>
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="auth-form-side">
        <div className="auth-container">
          
          <div className="auth-header">
            <div className="auth-logo">💎</div>
            <div className="auth-title">Đăng ký tài khoản</div>
            <div className="auth-subtitle">Bắt đầu hành trình Crypto của bạn</div>
          </div>

          <form onSubmit={submit}>
            <input 
              className="auth-input" 
              type="email" required placeholder="Email của bạn" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
            
            <input 
              className="auth-input" 
              type="password" required placeholder="Tạo mật khẩu" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />

            <button className="auth-btn" disabled={loading}>
              {loading ? "Đang tạo..." : "Đăng ký miễn phí"}
            </button>
          </form>

          <div className="auth-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>

        </div>
      </div>
    </div>
  );
}