import React, { useState, useEffect } from 'react';

export default function MetaMaskConnect({ onConnect, savedAddress }) {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [btnText, setBtnText] = useState('🔗 Kết nối MetaMask');

  // --- 1. CHỈ CẬP NHẬT GIAO DIỆN DỰA TRÊN savedAddress TỪ CHA GỬI XUỐNG ---
  useEffect(() => {
    if (savedAddress) {
      setDefaultAccount(savedAddress);
      setBtnText("Đã kết nối");
    } else {
      setDefaultAccount(null);
      setBtnText("🔗 Kết nối MetaMask");
    }
  }, [savedAddress]); 
  // -----------------------------------------------------------------------

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        // 1. BẮT BUỘC METAMASK MỞ CỬA SỔ CHỌN VÍ
        // Lệnh này sẽ reset quyền truy cập và buộc người dùng chọn lại ví
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });

        // 2. Sau khi chọn xong, lấy địa chỉ ví đó
        const result = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = result[0];
        
        // 3. Gửi lên Dashboard xử lý
        if (onConnect) {
          onConnect(account);
        }
        
      } catch (error) {
        // Nếu người dùng tắt popup mà không chọn
        console.log("Người dùng đã hủy chọn ví.");
        setErrorMessage("Bạn chưa chọn ví nào!");
      }
    } else {
      alert("Vui lòng cài đặt MetaMask!");
    }
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <button 
        onClick={connectWalletHandler}
        className={`wallet-btn ${defaultAccount ? 'connected' : ''}`}
        style={{
          background: defaultAccount ? '#28a745' : '#f6851b', // Xanh hoặc Cam
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: '0.3s'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 32 32">
            <path fill="#ffffff" d="M26.21 4.385l-4.57 16.517-5.632-6.526-5.64 6.526-4.572-16.517 7.042-2.903 3.169 5.862 3.177-5.862z"></path>
        </svg>
        
        {defaultAccount 
          ? `${defaultAccount.slice(0,6)}...${defaultAccount.slice(-4)}` 
          : btnText
        }
      </button>
    </div>
  );
}