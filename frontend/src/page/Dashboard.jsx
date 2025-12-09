import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // <--- 1. Import ethers
import API from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import MetaMaskConnect from '../components/MetaMaskConnect';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [web3Address, setWeb3Address] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // State hiển thị tên mạng (Ví dụ: Ethereum Mainnet, BSC...)
  const [networkName, setNetworkName] = useState("Unknown Network");

  // Dữ liệu tài sản (Mặc định là 0, sẽ cập nhật khi nối ví)
  const [assets, setAssets] = useState([
    { id: 'native', symbol: 'ETH', name: 'Native Token', balance: 0, price: 3500, icon: '🔷', change: '+2.1%' },
    // Các token dưới đây tạm thời vẫn là giả vì cần Smart Contract để lấy số dư thật
    { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: 0, price: 1.00, icon: '💵', change: '0.0%' },
  ]);

  // Market Ticker (Giá thị trường giả lập)
  const marketData = [
    { symbol: 'BTC', price: '$95,340', change: '+1.4%', isUp: true },
    { symbol: 'ETH', price: '$3,500', change: '+2.1%', isUp: true },
    { symbol: 'BNB', price: '$610', change: '-0.5%', isUp: false },
  ];

  // --- TÍNH TỔNG TÀI SẢN (USD) ---
  const totalBalanceUSD = assets.reduce((acc, item) => acc + (item.balance * item.price), 0);

  // --- 2. HÀM LẤY SỐ DƯ THẬT TỪ METAMASK ---
  const fetchBlockchainData = async (address) => {
    if (!window.ethereum) return;

    try {
      // Kết nối Provider (cầu nối với Blockchain)
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // a. Lấy thông tin mạng (Chain ID)
      const network = await provider.getNetwork();
      let symbol = "ETH";
      let name = "Ethereum";

      // Đổi tên Token theo mạng đang chọn
      if (network.chainId === 56n) { symbol = "BNB"; name = "Binance Coin"; } // BSC Mainnet
      if (network.chainId === 97n) { symbol = "tBNB"; name = "BNB Testnet"; } // BSC Testnet
      if (network.chainId === 137n) { symbol = "MATIC"; name = "Polygon"; }   // Polygon
      if (network.chainId === 11155111n) { symbol = "SepoliaETH"; name = "Sepolia Testnet"; } // Sepolia

      setNetworkName(name);

      // b. Lấy số dư Native (ETH/BNB...)
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei); // Chuyển từ Wei sang ETH

      console.log(`Số dư thật: ${balanceEth} ${symbol}`);

      // c. Cập nhật vào State Assets
      setAssets(prev => prev.map(item => {
        if (item.id === 'native') {
          return { 
            ...item, 
            balance: parseFloat(parseFloat(balanceEth).toFixed(4)), // Làm tròn 4 số lẻ
            symbol: symbol,
            name: name
          };
        }
        return item;
      }));

    } catch (error) {
      console.error("Lỗi đọc Blockchain:", error);
    }
  };

  // --- XỬ LÝ KHI KẾT NỐI VÍ ---
  const handleWalletConnect = (address) => {
    setWeb3Address(address);
    // Gọi hàm lấy số dư thật ngay khi kết nối
    fetchBlockchainData(address);
  };

  // Lắng nghe sự kiện đổi mạng trên MetaMask để load lại số dư
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload trang để cập nhật mạng mới
      });
    }
  }, []);

  // --- CÁC LOGIC CŨ (API Backend, Theme...) ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const fetchWallets = async () => {
      try {
        const res = await API.get('/wallets');
        setWallets(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [navigate, theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
  
  const copyToClipboard = (text) => {
    if (!text || text === "Chưa kết nối") return;
    navigator.clipboard.writeText(text);
    alert("Đã copy: " + text);
  };
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatAddress = (addr) => (addr && addr !== "Chưa kết nối") ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  // --- LOGIC HIỂN THỊ ---
  if (loading) return <div className="loading-screen">🚀 Đang tải...</div>;

  const displayAddress = web3Address || "Chưa kết nối";
  
  // Tìm đồng coin chính để hiển thị to trên thẻ
  const mainCoin = assets.find(a => a.id === 'native'); 

  return (
    <div className="dashboard-container">
      
      {/* 1. HEADER */}
      <div className="dashboard-header">
        <h2>🚀 CryptoDash</h2>
        <div className="header-actions">
          <button className="theme-btn" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
          <MetaMaskConnect onConnect={handleWalletConnect} />
          <button onClick={handleLogout} className="logout-btn">Thoát</button>
        </div>
      </div>

      {/* Hiển thị mạng đang kết nối */}
      {web3Address && (
        <div style={{marginBottom: 10, fontSize: 13, color: 'gray', textAlign: 'right'}}>
          Đang kết nối: <span style={{fontWeight: 'bold', color: 'var(--success)'}}>● {networkName}</span>
        </div>
      )}

      {/* 2. MARKET TICKER */}
      <div className="market-grid">
        {marketData.map((coin, index) => (
          <div key={index} className={`market-card ${coin.isUp ? 'up' : 'down'}`}>
            <div className="coin-name">{coin.symbol}</div>
            <div className="coin-price">{coin.price}</div>
            <div className={`coin-change ${coin.isUp ? 'text-green' : 'text-red'}`}>{coin.change}</div>
          </div>
        ))}
      </div>

      {/* 3. WALLET CARD (HIỂN THỊ SỐ DƯ THẬT) */}
      <div className="wallet-card">
        <div className="wallet-label">Tổng Tài Sản Thực Tế</div>
        
        <div className="wallet-balance">
          {formatCurrency(totalBalanceUSD)}
        </div>
        
        <div className="wallet-sub-info">
          ≈ {mainCoin.balance} {mainCoin.symbol}
        </div>
        
        <div className="wallet-address-box" onClick={() => copyToClipboard(displayAddress)}>
          <span className="address-text">{formatAddress(displayAddress)}</span>
          <span className="copy-text">📋 SAO CHÉP</span>
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="action-buttons">
        <Link to="/send" className="action-btn btn-send">↗ Gửi Tiền</Link>
        <Link to="/receive" className="action-btn btn-receive">↙ Nhận Tiền</Link>
      </div>

      {/* 5. ASSET LIST */}
      <div className="dashboard-grid">
        <div className="section-box">
          <div className="section-header">
            <div className="section-title">Danh mục Crypto</div>
          </div>
          <div className="asset-list">
            {assets.map((asset) => (
              <div className="list-item" key={asset.id}>
                <div className="item-left">
                  <div className="icon-box">{asset.icon}</div>
                  <div className="item-info">
                    <div className="asset-name">{asset.name}</div>
                    <div className="asset-amount">{asset.balance} {asset.symbol}</div>
                  </div>
                </div>
                <div className="item-right">
                  <div className="asset-value">{formatCurrency(asset.balance * asset.price)}</div>
                  <div className={`asset-change ${asset.change.includes('-') ? 'text-red' : 'text-green'}`}>
                    {asset.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LỊCH SỬ GIAO DỊCH (DEMO) */}
        <div className="section-box">
          <div className="section-title">Giao dịch gần đây</div>
          <div className="tx-list">
             <div style={{padding: 20, textAlign: 'center', color: 'gray', fontSize: 13}}>
                Lịch sử giao dịch cần API Etherscan để hiển thị dữ liệu thật.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}