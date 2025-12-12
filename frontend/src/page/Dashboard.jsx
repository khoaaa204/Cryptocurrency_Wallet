import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'; 
import API from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import MetaMaskConnect from '../components/MetaMaskConnect';
import TwoFactorAuth from '../components/TwoFactorAuth';
import AddressBook from '../components/AddressBook'; // Nhớ import AddressBook
import './Dashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Dashboard() {
  // 1. KHAI BÁO HOOK Ở TRÊN CÙNG (Bắt buộc)
  const navigate = useNavigate();
  
  // --- STATE ---
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [web3Address, setWeb3Address] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [networkName, setNetworkName] = useState("Unknown Network");
  const [marketPrices, setMarketPrices] = useState([]);

  // User State
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Assets State
  const [assets, setAssets] = useState([
    { id: 'native', symbol: 'ETH', name: 'Native Token', balance: 0, price: 3000, icon: '🔷', change: '+0.0%' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: 0, price: 1.00, icon: '💵', change: '0.0%' },
  ]);

  const totalBalanceUSD = assets.reduce((acc, item) => acc + (item.balance * item.price), 0);

  // --- 2. USE EFFECT CHÍNH (Xử lý Theme, Ví, Giá cả) ---
  useEffect(() => {
    // A. Set Theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

   // B. Hàm kiểm tra ví tự động (Auto Connect) - PHIÊN BẢN DEBUG
    const checkAutoConnect = async () => {
      if (!currentUser || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          const metaMaskAddress = accounts[0].toLowerCase(); // Chuyển về chữ thường
          const dbAddress = currentUser.address ? currentUser.address.toLowerCase() : ""; // Lấy từ DB

          console.log("--- KIỂM TRA TỰ ĐỘNG ---");
          console.log("1. Ví trên MetaMask:", metaMaskAddress);
          console.log("2. Ví trong Database:", dbAddress || "(Chưa có)");

          // LOGIC SO SÁNH:
          if (dbAddress === metaMaskAddress) {
            console.log("✅ Khớp ví -> KẾT NỐI NGAY");
            setWeb3Address(metaMaskAddress); // Hiện màu xanh
            fetchBlockchainData(metaMaskAddress);
          } else {
            console.log("❌ Không khớp (Hoặc DB chưa có ví) -> KHÔNG KẾT NỐI");
            setWeb3Address(null); // Giữ màu cam
            
            // Nếu DB chưa có ví, ta có thể hiện thông báo nhắc user kết nối lần đầu
            if (!dbAddress) {
                // console.log("Tài khoản mới, vui lòng bấm nút Kết nối lần đầu.");
            } else {
                toast.warning("Ví MetaMask không khớp với tài khoản này!");
            }
          }
        }
      } catch (err) {
        console.error("Lỗi check ví:", err);
      }
    };

    // C. Lấy ví từ Backend
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

    // D. Lấy giá CoinGecko
    const fetchPrices = async () => {
      try {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd&include_24hr_change=true";
        const { data } = await axios.get(url);

        const newMarketPrices = [
          { symbol: 'BTC', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change.toFixed(2)+'%', isUp: data.bitcoin.usd_24h_change > 0 },
          { symbol: 'ETH', price: data.ethereum.usd, change: data.ethereum.usd_24h_change.toFixed(2)+'%', isUp: data.ethereum.usd_24h_change > 0 },
          { symbol: 'BNB', price: data.binancecoin.usd, change: data.binancecoin.usd_24h_change.toFixed(2)+'%', isUp: data.binancecoin.usd_24h_change > 0 },
          { symbol: 'SOL', price: data.solana.usd, change: data.solana.usd_24h_change.toFixed(2)+'%', isUp: data.solana.usd_24h_change > 0 },
        ];
        setMarketPrices(newMarketPrices);
        
        // Cập nhật giá ETH vào Assets
        setAssets(prev => prev.map(a => {
            if(a.symbol === 'ETH') return { ...a, price: data.ethereum.usd };
            return a;
        }));
      } catch (error) { console.error("Lỗi CoinGecko:", error); }
    };

    // --- THỰC THI ---
    if (!currentUser) {
        navigate('/login');
    } else {
        fetchWallets();
        checkAutoConnect(); // Gọi hàm kiểm tra ví
        fetchPrices();
    }

    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);

  }, [navigate, theme, currentUser]); // Chạy lại khi currentUser thay đổi

  // --- 3. CÁC HÀM XỬ LÝ KHÁC ---

  const handle2FASuccess = () => {
    const updatedUser = { ...currentUser, is2FAEnabled: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    toast.success("Đã bật 2FA!");
  };

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
          return { ...item, balance: parseFloat(parseFloat(balanceEth).toFixed(4)), symbol, name };
        }
        return item;
      }));
    } catch (error) { console.error("Lỗi Blockchain:", error); }
  };

  // --- HÀM KẾT NỐI VÍ (BẤM NÚT) ---
  const handleWalletConnect = async (address) => {
    if (currentUser && currentUser._id) {
      try {
        await API.put('/user/update-wallet', {
          userId: currentUser._id,
          address: address
        });
        
        // Thành công mới hiện xanh
        setWeb3Address(address);
        fetchBlockchainData(address);
        toast.success("✅ Đã liên kết ví thành công!");
        
        const updatedUser = { ...currentUser, address: address };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);

      } catch (err) {
        console.error("Lỗi liên kết ví:", err);
        toast.error(err.response?.data?.message || "Lỗi lưu ví");
        setWeb3Address(null); // Lỗi thì về Cam
      }
    }
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
    toast.success("Đã sao chép!");
  };
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatAddress = (addr) => (addr && addr !== "Chưa kết nối") ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  // --- RENDER ---
  if (loading) return <div className="loading-screen">🚀 Đang tải dữ liệu...</div>;

  const displayAddress = web3Address || "Chưa kết nối";
  const mainCoin = assets.find(a => a.id === 'native');

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h2>🚀 CryptoDash</h2>
        <div className="header-actions">
          {/* Nút Admin */}
          {currentUser && currentUser.role === 'admin' && (
            <Link to="/admin" style={{ textDecoration: 'none', background: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', marginRight: '5px' }}>
              🛡️ Quản trị
            </Link>
          )}

          <button className="theme-btn" onClick={toggleTheme} title="Đổi giao diện">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <MetaMaskConnect onConnect={handleWalletConnect} savedAddress={web3Address} />
          
          <button onClick={handleLogout} className="logout-btn">Thoát</button>
        </div>
      </div>

      <div style={{ marginBottom: 25 }}>
        <TwoFactorAuth user={currentUser} onEnableSuccess={handle2FASuccess} />
      </div>

      {/* Cảnh báo lệch ví */}
      {currentUser?.address && web3Address && currentUser.address.toLowerCase() !== web3Address.toLowerCase() && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba', fontSize: '14px' }}>
            ⚠️ <strong>Cảnh báo:</strong> Bạn đang đăng nhập tài khoản <strong>{currentUser.email}</strong> nhưng MetaMask đang chọn ví lạ. Vui lòng kiểm tra lại.
        </div>
      )}

      {web3Address && (
        <div style={{marginBottom: 10, fontSize: 13, color: 'gray', textAlign: 'right'}}>
          Đang kết nối: <span style={{fontWeight: 'bold', color: 'var(--success)'}}>● {networkName}</span>
        </div>
      )}

      <div className="market-grid">
        {marketPrices.length > 0 ? marketPrices.map((coin, index) => (
          <div key={index} className={`market-card ${coin.isUp ? 'up' : 'down'}`}>
            <div className="coin-name">{coin.symbol} / USD</div>
            <div className="coin-price">${coin.price.toLocaleString()}</div>
            <div className={`coin-change ${coin.isUp ? 'text-green' : 'text-red'}`}>{coin.change}</div>
          </div>
        )) : <p style={{color:'gray'}}>Đang tải giá...</p>}
      </div>

      <div className="wallet-card">
        <div className="wallet-label">Tổng Tài Sản Thực Tế</div>
        <div className="wallet-balance">{formatCurrency(totalBalanceUSD)}</div>
        <div className="wallet-sub-info">≈ {mainCoin.balance} {mainCoin.symbol}</div>
        <div className="wallet-address-box" onClick={() => copyToClipboard(displayAddress)}>
          <span className="address-text">{formatAddress(displayAddress)}</span>
          <span className="copy-text">📋 SAO CHÉP</span>
        </div>
      </div>

      <div className="action-buttons">
        <Link to="/send" className="action-btn btn-send">↗ Gửi Tiền</Link>
        <Link to="/receive" className="action-btn btn-receive">↙ Nhận Tiền</Link>
      </div>

      <div className="dashboard-grid">
        {/* CỘT TRÁI: Assets + Address Book */}
        <div>
            <div className="section-box" style={{ marginBottom: 30 }}>
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
                        <div className="asset-change text-green">
                        {asset.symbol === 'ETH' && marketPrices.length > 0 ? marketPrices[1]?.change : '0.0%'}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            
            {/* COMPONENT DANH BẠ */}
            <AddressBook />
        </div>

        {/* CỘT PHẢI: Giao dịch */}
        <div>
            <div className="section-box" style={{ height: '100%' }}>
            <div className="section-title">Giao dịch gần đây</div>
            <div className="tx-list">
                <div style={{padding: 20, textAlign: 'center', color: 'gray', fontSize: 13}}>
                    Lịch sử giao dịch cần API Etherscan để hiển thị dữ liệu thật.
                </div>
            </div>
            </div>
        </div>
      </div>

    </div>
  );
}