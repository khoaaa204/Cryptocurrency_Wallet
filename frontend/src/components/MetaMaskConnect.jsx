import React, { useState, useEffect } from 'react';

export default function MetaMaskConnect({ onConnect }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [btnText, setBtnText] = useState('🔗 Kết nối MetaMask');

  // Hàm xử lý khi bấm nút kết nối
  const connectWalletHandler = async () => {
    // 1. Kiểm tra trình duyệt có MetaMask không
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        // 2. Yêu cầu MetaMask cấp quyền truy cập
        const result = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 3. Lấy địa chỉ ví đầu tiên
        const address = result[0];
        accountChangedHandler(address);
      } catch (error) {
        setErrorMessage("Người dùng từ chối kết nối!");
      }
    } else {
      setErrorMessage("Chưa cài đặt MetaMask! Vui lòng cài đặt extension.");
    }
  };

  // Hàm xử lý khi lấy được địa chỉ ví
  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
    setBtnText("Đã kết nối");
    
    // Gửi địa chỉ ví ra bên ngoài (cho Dashboard dùng)
    if (onConnect) {
      onConnect(newAccount);
    }
  };

  // Tự động lắng nghe nếu người dùng đổi ví trên MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          accountChangedHandler(accounts[0]);
        } else {
          setDefaultAccount(null);
          setBtnText('🔗 Kết nối MetaMask');
        }
      });
    }
  }, []);

  return (
    <div style={{ marginBottom: '10px' }}>
      <button 
        onClick={connectWalletHandler}
        style={{
          background: defaultAccount ? '#28a745' : '#f6851b', // Xanh nếu đã nối, Cam (màu MetaMask) nếu chưa
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {/* Icon hồ ly MetaMask (SVG đơn giản) */}
        <svg width="20" height="20" viewBox="0 0 32 32">
            <path fill="#ffffff" d="M26.21 4.385l-4.57 16.517-5.632-6.526-5.64 6.526-4.572-16.517 7.042-2.903 3.169 5.862 3.177-5.862z"></path>
        </svg>
        {defaultAccount ? `${defaultAccount.slice(0,6)}...${defaultAccount.slice(-4)}` : btnText}
      </button>

      {errorMessage && (
        <p style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>{errorMessage}</p>
      )}
    </div>
  );
}