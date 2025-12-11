import React, { useState } from 'react';
import API from '../api/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { resetToken } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPass) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      const res = await API.put(`/auth/resetpassword/${resetToken}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000); // Chuyển về login sau 3s
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  if (message) {
    return (
      <div className="auth-container" style={{textAlign: 'center'}}>
        <h3 style={{color: 'green'}}>✅ Thành công!</h3>
        <p>{message}</p>
        <p>Đang chuyển về trang đăng nhập...</p>
        <Link to="/login">Bấm vào đây nếu không tự chuyển</Link>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-title">Đặt lại Mật khẩu</div>
      
      {error && <div style={{background: '#fee2e2', color:'#b91c1c', padding: 10, borderRadius: 5, marginBottom: 15}}>{error}</div>}

      <form onSubmit={submit}>
        <input 
          className="auth-input" 
          type="password" 
          required placeholder="Mật khẩu mới" 
          value={password} onChange={(e) => setPassword(e.target.value)} 
        />
        <input 
          className="auth-input" 
          type="password" 
          required placeholder="Xác nhận mật khẩu mới" 
          value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} 
        />
        <button className="auth-btn">Đổi Mật Khẩu</button>
      </form>
    </div>
  );
}