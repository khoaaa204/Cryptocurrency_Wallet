import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'; 
import API from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import MetaMaskConnect from '../components/MetaMaskConnect';
import TwoFactorAuth from '../components/TwoFactorAuth';
import './Dashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify'; // <--- 1. Đã thêm import Toast

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE QUẢN LÝ ---
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [web3Address, setWeb3Address] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [networkName, setNetworkName] = useState("Unknown Network");
  
  // State lưu giá thị trường (CoinGecko)
  const [marketPrices, setMarketPrices] = useState([]); // <--- 2. Chỉ giữ 1 khai báo State này

  // State lưu thông tin User hiện tại
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Dữ liệu tài sản (Assets)
  const [assets, setAssets] = useState([
    { id: 'native', symbol: 'ETH', name: 'Native Token', balance: 0, price: 3500, icon: '🔷', change: '+0.0%' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: 0, price: 1.00, icon: '💵', change: '0.0%' },
  ]);

  // Tính tổng tài sản (USD)
  const totalBalanceUSD = assets.reduce((acc, item) => acc + (item.balance * item.price), 0);

  // --- 1. SETUP THEME, API USER & COINGECKO ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // A. Lấy thông tin ví từ Backend
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

    // B. Lấy giá CoinGecko (Real-time)
    const fetchPrices = async () => {
      try {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd&include_24hr_change=true";
        const { data } = await axios.get(url);

        const newMarketPrices = [
          { 
            symbol: 'BTC', 
            price: data.bitcoin.usd, 
            change: data.bitcoin.usd_24h_change.toFixed(2) + '%', 
            isUp: data.bitcoin.usd_24h_change > 0 
          },
          { 
            symbol: 'ETH', 
            price: data.ethereum.usd, 
            change: data.ethereum.usd_24h_change.toFixed(2) + '%', 
            isUp: data.ethereum.usd_24h_change > 0 
          },
          { 
            symbol: 'BNB', 
            price: data.binancecoin.usd, 
            change: data.binancecoin.usd_24h_change.toFixed(2) + '%', 
            isUp: data.binancecoin.usd_24h_change > 0 
          },
          { 
            symbol: 'SOL', 
            price: data.solana.usd, 
            change: data.solana.usd_24h_change.toFixed(2) + '%', 
            isUp: data.solana.usd_24h_change > 0 
          },
        ];
        setMarketPrices(newMarketPrices);
        
        // Cập nhật giá ETH vào danh sách Assets để tính tổng tiền chính xác hơn
        setAssets(prev => prev.map(a => {
            if(a.symbol === 'ETH') return { ...a, price: data.ethereum.usd };
            return a;
        }));

      } catch (error) {
        console.error("Lỗi lấy giá CoinGecko:", error);
      }
    };

    if (!currentUser) navigate('/login');
    
    fetchWallets();
    fetchPrices();
    
    // Cập nhật giá mỗi 60s
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);

  }, [navigate, theme, currentUser]);

  // --- 2. HÀM XỬ LÝ 2FA ---
  const handle2FASuccess = () => {
    const updatedUser = { ...currentUser, is2FAEnabled: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    toast.success("Đã bật bảo mật 2 lớp!");
  };

  // --- 3. HÀM LẤY SỐ DƯ TỪ BLOCKCHAIN ---
  const fetchBlockchainData = async (address) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      let symbol = "ETH";
      let name = "Ethereum";

      if (network.chainId === 56n) { symbol = "BNB"; name = "Binance Coin"; }
      if (network.chainId === 97n) { symbol = "tBNB"; name = "BNB Testnet"; }
      if (network.chainId === 11155111n) { symbol = "SepoliaETH"; name = "Sepolia Testnet"; }

      setNetworkName(name);

      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);

      setAssets(prev => prev.map(item => {
        if (item.id === 'native') {
          return { 
            ...item, 
            balance: parseFloat(parseFloat(balanceEth).toFixed(4)), 
            symbol: symbol,
            name: name
          };
        }
        return item;
      }));
    } catch (error) {
      console.error("Lỗi Blockchain:", error);
    }
  };

  // --- 4. CÁC HÀM TIỆN ÍCH KHÁC ---
  const handleWalletConnect = (address) => {
    setWeb3Address(address);
    fetchBlockchainData(address);
    toast.info("Đã kết nối ví: " + address.slice(0,6) + "...");
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.info("Đã đăng xuất");
  };

  const copyToClipboard = (text) => {
    if (!text || text === "Chưa kết nối") return;
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép địa chỉ ví!"); // Dùng Toast thay Alert
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatAddress = (addr) => (addr && addr !== "Chưa kết nối") ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  // --- RENDER GIAO DIỆN ---
  if (loading) return <div className="loading-screen">🚀 Đang tải dữ liệu...</div>;

  const displayAddress = web3Address || "Chưa kết nối";
  const mainCoin = assets.find(a => a.id === 'native');

  return (
    <div className="dashboard-container">
      
      {/* 1. HEADER */}
      <div className="dashboard-header">
        <h2>🚀 CryptoDash</h2>
        <div className="header-actions">
          <button className="theme-btn" onClick={toggleTheme} title="Đổi giao diện">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <MetaMaskConnect onConnect={handleWalletConnect} />
          <button onClick={handleLogout} className="logout-btn">Thoát</button>
        </div>
      </div>

      {/* --- PHẦN 2FA --- */}
      <div style={{ marginBottom: 25 }}>
        <TwoFactorAuth user={currentUser} onEnableSuccess={handle2FASuccess} />
      </div>

      {/* Hiển thị mạng */}
      {web3Address && (
        <div style={{marginBottom: 10, fontSize: 13, color: 'gray', textAlign: 'right'}}>
          Đang kết nối: <span style={{fontWeight: 'bold', color: 'var(--success)'}}>● {networkName}</span>
        </div>
      )}

      {/* 2. MARKET TICKER (Dùng dữ liệu thật từ CoinGecko) */}
      <div className="market-grid">
        {marketPrices.length > 0 ? marketPrices.map((coin, index) => (
          <div key={index} className={`market-card ${coin.isUp ? 'up' : 'down'}`}>
            <div className="coin-name">{coin.symbol} / USD</div>
            <div className="coin-price">${coin.price.toLocaleString()}</div>
            <div className={`coin-change ${coin.isUp ? 'text-green' : 'text-red'}`}>{coin.change}</div>
          </div>
        )) : (
          <p style={{fontSize: 12, color: 'gray'}}>Đang tải giá thị trường...</p>
        )}
      </div>

      {/* 3. THẺ TỔNG TÀI SẢN */}
      <div className="wallet-card">
        <div className="wallet-label">Tổng Tài Sản Thực Tế</div>
        <div className="wallet-balance">{formatCurrency(totalBalanceUSD)}</div>
        <div className="wallet-sub-info">≈ {mainCoin.balance} {mainCoin.symbol}</div>
        
        <div className="wallet-address-box" onClick={() => copyToClipboard(displayAddress)}>
          <span className="address-text">{formatAddress(displayAddress)}</span>
          <span className="copy-text">📋 SAO CHÉP</span>
        </div>
      </div>

      {/* 4. ACTION BUTTONS */}
      <div className="action-buttons">
        <Link to="/send" className="action-btn btn-send">↗ Gửi Tiền</Link>
        <Link to="/receive" className="action-btn btn-receive">↙ Nhận Tiền</Link>
      </div>

      {/* 5. DANH SÁCH TÀI SẢN */}
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
                  {/* Hiển thị thay đổi giá nếu có */}
                  <div className="asset-change text-green">
                    {asset.symbol === 'ETH' && marketPrices.length > 0 ? marketPrices[1]?.change : '0.0%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-box">
          <div className="section-title">Giao dịch gần đây</div>
          <div className="tx-list">
             <div style={{padding: 20, textAlign: 'center', color: 'gray', fontSize: 13}}>
                Kết nối Etherscan API để xem lịch sử.
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}