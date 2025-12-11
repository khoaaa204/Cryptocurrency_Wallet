import React, { useState } from 'react';
import API from '../api/api';

export default function TwoFactorAuth({ user, onEnableSuccess }) {
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  // 1. Bấm nút để hiện mã QR
  const handleSetup = async () => {
    try {
      const userLocal = JSON.parse(localStorage.getItem('user'));
      // Gọi API Backend tạo mã QR
      const res = await API.post('/auth/2fa/setup', { userId: userLocal._id });
      setQrCode(res.data.qrCode); // Lưu ảnh QR vào state
      setMessage("Vui lòng quét mã QR bằng Google Authenticator");
    } catch (err) {
      toast.success("Lỗi tạo mã QR");
    }
  };

  // 2. Bấm nút xác nhận mã 6 số
  const handleVerify = async () => {
    try {
      const userLocal = JSON.parse(localStorage.getItem('user'));
      
      // Gọi API Backend kiểm tra mã
      await API.post('/auth/2fa/verify', { 
        userId: userLocal._id, 
        token: token 
      });

      toast.success("✅ Bảo mật 2 lớp đã được BẬT thành công!");
      setQrCode(null); // Tắt mã QR đi
      if (onEnableSuccess) onEnableSuccess(); // Báo cho Dashboard biết để load lại
    } catch (err) {
      toast.success("❌ Mã xác thực sai. Vui lòng thử lại!");
    }
  };

  // Nếu user đã bật 2FA rồi thì hiện thông báo đã bật
  if (user?.is2FAEnabled) {
    return (
      <div style={{ marginTop: 20, padding: 15, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 10, border: '1px solid #10b981' }}>
        ✅ <strong>Tài khoản đã được bảo vệ (2FA đang Bật)</strong>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-card)', borderRadius: 15, boxShadow: 'var(--shadow)' }}>
      <h3 style={{ marginTop: 0 }}>🛡️ Bảo mật 2 lớp (2FA)</h3>
      
      {!qrCode ? (
        // Trạng thái 1: Chưa bật -> Hiện nút Bật
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            Bảo vệ tài khoản bằng Google Authenticator.
          </p>
          <button 
            onClick={handleSetup}
            style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Bắt đầu cài đặt
          </button>
        </div>
      ) : (
        // Trạng thái 2: Đang quét mã QR
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'orange', fontWeight: 'bold' }}>{message}</p>
          
          {/* Hiển thị ảnh QR */}
          <img src={qrCode} alt="QR Code" style={{ border: '5px solid white', borderRadius: 10, marginBottom: 15 }} />
          
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="Nhập 6 số (VD: 123456)" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', width: 150, textAlign: 'center', fontSize: 16 }}
            />
            <button 
              onClick={handleVerify}
              style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
            >
              Xác nhận
            </button>
          </div>
          
          <button onClick={() => setQrCode(null)} style={{ marginTop: 10, background: 'none', border: 'none', color: 'gray', cursor: 'pointer', textDecoration: 'underline' }}>
            Hủy bỏ
          </button>
        </div>
      )}
    </div>
  );
}