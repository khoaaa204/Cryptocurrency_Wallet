import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import '../Auth.css'; // File CSS chung cho Login/Register
import { toast } from 'react-toastify';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); // Bắt đầu loading

    try {
      // Gọi API đăng nhập
      const res = await API.post('/auth/login', { email, password });

      // Lưu Token và User vào LocalStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Thông báo và chuyển hướng
      toast.success("🚀 Đăng nhập thành công!");
      navigate('/dashboard'); 

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi đăng nhập"); 
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-title">Đăng nhập</div>
      
      <form onSubmit={submit}>
        {/* Input Email */}
        <input 
          className="auth-input" 
          type="email" 
          required 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        
        {/* Input Password */}
        <input 
          className="auth-input" 
          type="password" 
          required 
          placeholder="Mật khẩu" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />

        {/* Link Quên mật khẩu (Nằm bên phải) */}
        <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -10 }}>
          <Link 
            to="/forgot-password" 
            style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút Submit */}
        <button className="auth-btn" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      {/* Link chuyển sang Đăng ký */}
      <p className="auth-link">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
}