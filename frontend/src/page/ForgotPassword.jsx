import React, { useState } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Auth.css'; // Dùng chung CSS với Login

// Bạn có thể dùng chung ảnh bg-crypto.jpg hoặc tìm 1 ảnh khác về "Lock/Security"
import bgImage from '../assets/bg-crypto.jpg'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Vui lòng nhập email!");

    setLoading(true);
    try {
      const res = await API.post('/auth/forgotpassword', { email });
      toast.success("📧 Đã gửi link khôi phục! Hãy kiểm tra Email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Không tìm thấy email này.");
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
      </div>

      {/* 2. CỘT PHẢI (FORM) */}
      <div className="auth-form-side">
        <div className="auth-container" style={{textAlign: 'center'}}>
          
          {/* Icon Khóa (Minh họa) */}
          <div style={{
            fontSize: '60px', 
            marginBottom: '20px', 
            background: '#f0f4ff', 
            width: '100px', 
            height: '100px', 
            lineHeight: '100px', 
            borderRadius: '50%', 
            margin: '0 auto 20px auto',
            color: '#1539c9'
          }}>
            🔒
          </div>

          <div className="auth-branding">
            <div className="app-name" style={{marginBottom: 10}}>Khôi phục tài khoản</div>
            <p className="welcome-text" style={{fontSize: 15, color: '#666', lineHeight: 1.5}}>
              Nhập địa chỉ email đã đăng ký của bạn.<br/>
              Chúng tôi sẽ gửi một đường dẫn để đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={submit} style={{textAlign: 'left', marginTop: 30}}>
            <label className="input-label">Email đăng ký</label>
            <input 
              className="auth-input" 
              type="email" 
              required
              placeholder="VD: nam@gmail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            
            <button className="auth-btn" disabled={loading}>
              {loading ? "Đang gửi email..." : "Gửi link khôi phục"}
            </button>
          </form>

          {/* Link Quay lại */}
          <div style={{marginTop: 30}}>
            <Link to="/login" style={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 5, 
              textDecoration: 'none', 
              color: '#333', 
              fontWeight: 600,
              fontSize: 14
            }}>
              <span style={{fontSize: 18}}>←</span> Quay lại Đăng nhập
            </Link>
          </div>

        </div>
        
        {/* Footer */}
        <div className="auth-footer">
          <span style={{color: '#999'}}>Cần hỗ trợ? Liên hệ 1900 545 426</span>
        </div>

      </div>
    </div>
  );
}