import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers'; // Dùng thư viện này để đọc thông tin mạng
import './Receive.css';

export default function Receive() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [networkName, setNetworkName] = useState('Đang tải...');
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Load Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // --- LOGIC LẤY ĐỊA CHỈ THẬT TỪ METAMASK ---
  useEffect(() => {
    const loadWalletInfo = async () => {
      // 1. Kiểm tra MetaMask
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Lấy địa chỉ ví đang active
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          setAddress(userAddress);

          // Lấy thông tin mạng (Chain ID)
          const network = await provider.getNetwork();
          let name = "Unknown Network";
          
          // Map tên mạng phổ biến
          if (network.chainId === 1n) name = "Ethereum Mainnet 🔴 (Tiền thật)";
          if (network.chainId === 11155111n) name = "Sepolia Testnet 🟢 (Tiền giả lập)";
          if (network.chainId === 56n) name = "BNB Smart Chain";
          if (network.chainId === 97n) name = "BSC Testnet";

          setNetworkName(name);

        } catch (error) {
          console.error("Lỗi đọc ví:", error);
          toast.success("Vui lòng mở khóa MetaMask!");
        }
      } else {
        // Fallback: Nếu không có MetaMask thì lấy từ Database (như cũ)
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setAddress(user.address || "");
          setNetworkName("Không phát hiện MetaMask");
        }
      }
    };

    loadWalletInfo();

    // Lắng nghe sự kiện đổi ví hoặc đổi mạng trên MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', loadWalletInfo);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="receive-container">
      <div className="receive-card">
        {/* Header */}
        <div className="receive-header">
          <h2>📥 Nhận Crypto</h2>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Cảnh báo Mạng lưới (RẤT QUAN TRỌNG KHI NHẬN TIỀN) */}
        <div style={{
          marginBottom: 15, 
          padding: '8px 12px', 
          background: networkName.includes('Testnet') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: networkName.includes('Testnet') ? '#10b981' : '#ef4444',
          borderRadius: 8, fontSize: 13, fontWeight: 'bold'
        }}>
          Mạng hiện tại: {networkName}
        </div>

        <div className="info-text">Quét mã để gửi tiền vào ví này</div>

        {/* QR Code */}
        <div className="qr-box">
          {address ? (
            <QRCodeCanvas 
              value={address} 
              size={200} 
              level={"H"} 
              includeMargin={true}
              imageSettings={{
                src: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
                x: undefined, y: undefined, height: 40, width: 40, excavate: true,
              }}
            />
          ) : (
            <p>Đang tải thông tin ví...</p>
          )}
        </div>
        
        {/* Address Display */}
        <div className="info-text">Địa chỉ ví của bạn</div>
        <div className="address-box" style={{fontSize: 13}}>
          {address}
        </div>

        {/* Copy Button */}
        <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? "✅ Đã sao chép!" : "📋 Sao chép địa chỉ"}
        </button>

        <div className="network-warning">
          ⚠️ <strong>Lưu ý:</strong> Chỉ gửi tài sản thuộc mạng <strong>{networkName}</strong> vào địa chỉ này. Gửi sai mạng lưới có thể mất tài sản vĩnh viễn.
        </div>

        <Link to="/dashboard" className="back-link" style={{display: 'block', marginTop: 20, textDecoration: 'none', color: 'var(--text-sub)'}}>
          ← Quay lại Dashboard
        </Link>
      </div>
    </div>
  );
}