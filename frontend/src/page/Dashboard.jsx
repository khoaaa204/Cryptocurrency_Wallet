import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import API from '../api/api'; // Đảm bảo đường dẫn đúng
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import Components
import MetaMaskConnect from '../components/MetaMaskConnect';
import TwoFactorAuth from '../components/TwoFactorAuth';
import AddressBook from '../components/AddressBook';
import NFTGallery from '../components/NFTGallery';
import PriceChart from '../components/PriceChart';

// Import CSS
import './Dashboard.css';

// Utilities
import { NETWORKS } from '../utils/networks';
import { fetchTransactionHistory, fetchTokenBalance, switchNetwork } from '../utils/web3Service';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [web3Address, setWeb3Address] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currentChainId, setCurrentChainId] = useState(null); 
  const [currency, setCurrency] = useState('USD'); 
  const [exchangeRate, setExchangeRate] = useState(25000); 
  
  // Data State
  const [assets, setAssets] = useState([]); 
  const [transactions, setTransactions] = useState([]); 
  const [marketPrices, setMarketPrices] = useState([]); 
  const [activeTab, setActiveTab] = useState('assets'); 
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- LOGIC TỰ ĐỘNG PHÁT HIỆN MẠNG ---
  // Tìm xem ID mạng hiện tại (ví dụ 0xaa36a7) có khớp với key nào trong NETWORKS không
  const currentNetworkKey = Object.keys(NETWORKS).find(
    (key) => NETWORKS[key].chainId.toLowerCase() === String(currentChainId).toLowerCase()
  ) || "";

  // Tính tổng tài sản
  const totalBalanceUSD = assets.reduce((acc, item) => {
    const price = item.price || 0; 
    return acc + (parseFloat(item.balance) * price);
  }, 0);

  // --- EFFECT ---
  useEffect(() => {
    // Set Theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    const initDashboard = async () => {
      try {
        await API.get('/wallets'); // Check token
      } catch (err) { /* Silent fail */ }
      setLoading(false);

      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // 1. Lấy thông tin mạng ban đầu
          const network = await provider.getNetwork();
          const chainIdHex = "0x" + network.chainId.toString(16);
          setCurrentChainId(chainIdHex);

          // 2. Lấy thông tin tài khoản
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const metaMaskAddress = accounts[0];
            if (currentUser.address && currentUser.address.toLowerCase() === metaMaskAddress.toLowerCase()) {
              setWeb3Address(metaMaskAddress);
              loadBlockchainData(metaMaskAddress);
            }
          }
          
          // 3. LẮNG NGHE SỰ KIỆN ĐỔI MẠNG (Tự động cập nhật UI)
          window.ethereum.on('chainChanged', (newChainId) => {
            console.log("Mạng đã đổi sang:", newChainId);
            setCurrentChainId(newChainId);
            window.location.reload(); // Reload để làm mới dữ liệu
          });

        } catch (err) {
          console.error(err);
        }
      }
    };

    initDashboard();
    fetchMarketPrices();
    
    // Auto refresh giá mỗi 60s
    const interval = setInterval(fetchMarketPrices, 60000);
    return () => clearInterval(interval);
  }, [navigate, theme, currentUser]);

  // --- HELPERS ---
  const formatMoney = (amountUSD) => {
    const val = parseFloat(amountUSD || 0);
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val * exchangeRate);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const loadBlockchainData = async (address) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Update lại ChainId để chắc chắn
      const network = await provider.getNetwork();
      const chainIdHex = "0x" + network.chainId.toString(16);
      setCurrentChainId(chainIdHex);

      let activeNetworkKey = Object.keys(NETWORKS).find(key => NETWORKS[key].chainId == chainIdHex);
      let activeNetworkConfig = NETWORKS[activeNetworkKey];

      // Lấy số dư Native
      const balance = await provider.getBalance(address);
      const nativeSymbol = activeNetworkConfig?.nativeCurrency.symbol || "ETH";
      const networkName = activeNetworkConfig ? activeNetworkConfig.chainName : "Unknown Network";
      
      const nativeAsset = {
        id: 'native',
        symbol: nativeSymbol,
        name: networkName, 
        balance: parseFloat(ethers.formatEther(balance)).toFixed(4),
        price: getPriceFromMarket(nativeSymbol),
        icon: '💎'
      };

      setAssets([nativeAsset]); 

      // Lấy lịch sử giao dịch
      if (activeNetworkConfig) {
        const history = await fetchTransactionHistory(address, activeNetworkConfig);
        setTransactions(history);
      } else {
        setTransactions([]); 
      }
    } catch (error) {
      console.error("Lỗi load blockchain:", error);
    }
  };

  const handleImportToken = async () => {
    const tokenAddress = prompt("Nhập địa chỉ hợp đồng Token (Contract Address):");
    if (!tokenAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const newToken = await fetchTokenBalance(tokenAddress, web3Address, provider);
      if (newToken) {
        setAssets(prev => [...prev, { ...newToken, icon: '🪙', price: 1 }]); 
        toast.success(`Đã thêm token ${newToken.symbol}`);
      } else {
        toast.error("Không thể đọc token hoặc mạng không hỗ trợ.");
      }
    } catch (e) { toast.error("Lỗi Import Token"); }
  };

  const handleWalletConnect = async (address) => {
    if (currentUser?._id) {
      try {
        await API.put('/user/update-wallet', { userId: currentUser._id, address });
        setWeb3Address(address);
        loadBlockchainData(address);
        toast.success("Đã liên kết ví!");
        const updatedUser = { ...currentUser, address };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      } catch (err) { toast.error("Lỗi lưu ví"); }
    }
  };

  const fetchMarketPrices = async () => {
    try {
      const { data } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,tether&vs_currencies=usd,vnd&include_24hr_change=true");
      
      if (data.tether && data.tether.vnd) {
         setExchangeRate(data.tether.vnd);
      }

      setMarketPrices([
        { symbol: 'BTC', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
        { symbol: 'ETH', price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
        { symbol: 'BNB', price: data.binancecoin.usd, change: data.binancecoin.usd_24h_change },
        { symbol: 'SOL', price: data.solana.usd, change: data.solana.usd_24h_change },
      ]);
      
      setAssets(prev => prev.map(a => {
        if(a.symbol === 'ETH' && data.ethereum) return { ...a, price: data.ethereum.usd };
        if(a.symbol === 'BNB' && data.binancecoin) return { ...a, price: data.binancecoin.usd };
        return a;
      }));

    } catch (e) {
      console.log("CoinGecko Error (Rate Limit?)");
    }
  };

  const getPriceFromMarket = (symbol) => {
    if(symbol === 'tBNB') symbol = 'BNB';
    if(symbol === 'SepoliaETH') symbol = 'ETH';
    const found = marketPrices.find(p => p.symbol === symbol);
    return found ? found.price : 0;
  };

  const copyToClipboard = (text) => {
    if (!text || text === "Chưa kết nối") return;
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  const displayAddress = web3Address || "Chưa kết nối";
  const mainCoin = assets.length > 0 ? assets[0] : { balance: 0, symbol: '...' };

  if (loading) return <div className="loading-screen">🚀 Đang tải dữ liệu...</div>;

  return (
    <div className="dashboard-container">
      
      {/* 1. HEADER */}
      <header className="dashboard-header">
        <h2>CryptoDash</h2>
        <div className="header-actions">
          {/* SELECT MẠNG (Tự động cập nhật value) */}
          <select 
            className="network-select" 
            onChange={(e) => switchNetwork(e.target.value, NETWORKS)} 
            value={currentNetworkKey} 
          >
            {!currentNetworkKey && <option value="">⚠️ Mạng lạ</option>}
            <option value="" disabled>-- Chọn mạng --</option>
            <option value="ethereum">Ethereum Mainnet</option>
            <option value="bsc">BNB Smart Chain</option>
            <option disabled>──────────</option>
            <option value="sepolia">Sepolia Testnet</option>
            <option value="bscTestnet">BSC Testnet</option>
          </select>

          {currentUser && currentUser.role === 'admin' && (
            <Link to="/admin" className="btn-action admin-btn">🛡️ Admin</Link>
          )}
          
          <Link to="/swap" className="btn-action" style={{border: 'none', background:'#ec4899', color:'white'}}>
            🔄 Swap
          </Link>
          
          <MetaMaskConnect onConnect={handleWalletConnect} savedAddress={web3Address} />
          
          <button className="btn-action" onClick={() => setCurrency(c => c === 'USD' ? 'VND' : 'USD')}>
            {currency === 'USD' ? '🇺🇸' : '🇻🇳'}
          </button>
          
          <button className="theme-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn">
            Thoát
          </button>
        </div>
      </header>

      {/* 2FA Section */}
      <div style={{marginBottom: 20}}>
         <TwoFactorAuth user={currentUser} onEnableSuccess={() => toast.success("Bật 2FA thành công")} />
      </div>

      {/* Cảnh báo lệch ví */}
      {currentUser?.address && web3Address && currentUser.address.toLowerCase() !== web3Address.toLowerCase() && (
        <div className="alert-warning">
            ⚠️ <strong>Cảnh báo:</strong> Tài khoản web ({currentUser.email}) đang liên kết ví khác với ví MetaMask hiện tại.
        </div>
      )}

      {/* 2. MARKET TICKER */}
      <div className="market-grid">
        {marketPrices.map((coin, idx) => (
          <div key={idx} className="market-card">
            <div className="coin-name">{coin.symbol} / USD</div>
            <div className="coin-price">${coin.price.toLocaleString()}</div>
            <div className={`coin-change ${coin.change >= 0 ? 'text-green' : 'text-red'}`}>
              {coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* 3. HERO WALLET CARD */}
      <div className="wallet-card">
        <div className="wallet-label">Tổng Tài Sản Ước Tính</div>
        <div className="wallet-balance">{formatMoney(totalBalanceUSD)}</div>
        <div className="wallet-sub-info">
          Khả dụng: {mainCoin.balance} {mainCoin.symbol}
        </div>
        <div className="wallet-address-box" onClick={() => copyToClipboard(displayAddress)}>
          {displayAddress !== "Chưa kết nối" ? `${displayAddress.slice(0,6)}...${displayAddress.slice(-4)}` : "Chưa kết nối ví"}
          <span className="copy-text">Sao chép</span>
        </div>
      </div>

      <div className="action-buttons">
        <Link to="/send" className="action-btn btn-send">↗ Gửi Tiền</Link>
        <Link to="/receive" className="action-btn btn-receive">↙ Nhận Tiền</Link>
      </div>

      {/* 4. MAIN GRID LAYOUT */}
      <div className="dashboard-grid">
        
        {/* CỘT TRÁI: ASSETS + NFTS + ADDRESS BOOK */}
        <div className="left-col">
          <div className="tab-container">
            <button 
              className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
              onClick={() => setActiveTab('assets')}>
              💰 Tài sản
            </button>
            <button 
              className={`tab-btn ${activeTab === 'nfts' ? 'active' : ''}`}
              onClick={() => setActiveTab('nfts')}>
              🖼️ NFTs
            </button>
          </div>

          <div className="section-box" style={{marginBottom: 24}}>
            {activeTab === 'assets' ? (
              <>
                <div className="section-header">
                  <div className="section-title">Danh mục đầu tư</div>
                  <button className="btn-add-token" onClick={handleImportToken} disabled={!web3Address}>
                    + Import Token
                  </button>
                </div>
                
                {/* --- KHU VỰC CUỘN DANH SÁCH TÀI SẢN (Có height cứng để cuộn) --- */}
                <div style={{ height: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                  {assets.length > 0 ? assets.map((asset, idx) => (
                    <div className="list-item" key={idx}>
                      <div className="item-left">
                        <div className="icon-box" style={{fontSize: '20px'}}>{asset.icon}</div>
                        <div>
                          <div className="asset-name">{asset.name || asset.symbol}</div>
                          <div className="asset-amount">{asset.balance} {asset.symbol}</div>
                        </div>
                      </div>
                      <div className="item-right">
                        <div className="asset-value">
                          {formatMoney(parseFloat(asset.balance) * (asset.price || 0))}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{textAlign:'center', padding: '40px', color:'gray'}}>Chưa có tài sản</div>
                  )}
                </div>
              </>
            ) : (
              <NFTGallery address={web3Address} chainId={currentChainId} />
            )}
          </div>

          <div className="section-box">
             <div className="section-header"><div className="section-title">Danh bạ</div></div>
             <AddressBook />
          </div>
        </div>

        {/* CỘT PHẢI: BIỂU ĐỒ + LỊCH SỬ GIAO DỊCH */}
        <div className="right-col">
          {/* Sửa lỗi biểu đồ: Cần có height cứng cho thẻ cha */}
          <div className="section-box" style={{marginBottom: 24, height: '450px', display:'flex', flexDirection:'column'}}>
             {/* Component biểu đồ */}
             <PriceChart coinId="ethereum" currency={currency.toLowerCase()} />
          </div>

          <div className="section-box">
            <div className="section-header">
              <div className="section-title">Lịch sử gần đây</div>
            </div>

            {/* --- KHU VỰC CUỘN LỊCH SỬ GIAO DỊCH --- */}
            <div style={{ height: '350px', overflowY: 'auto', paddingRight: '5px' }}>
              {transactions.length > 0 ? transactions.map(tx => {
                const isReceive = tx.to.toLowerCase() === web3Address?.toLowerCase();
                return (
                  <div className="list-item" key={tx.hash}>
                    <div className="item-left">
                      <div className="icon-box" style={{
                        background: isReceive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isReceive ? '#10b981' : '#ef4444',
                        fontSize: 16, width: 35, height: 35, display: 'flex', justifyContent: 'center', alignItems: 'center'
                      }}>
                        {isReceive ? '↓' : '↑'}
                      </div>
                      <div>
                        <div style={{fontWeight: 600, fontSize: 14}}>
                          {isReceive ? 'Nhận tiền' : 'Gửi tiền'}
                        </div>
                        <div style={{fontSize: 12, color: 'gray'}}>
                          {new Date(tx.timeStamp * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="item-right">
                      <div style={{
                        fontWeight: 600, 
                        color: isReceive ? '#10b981' : '#ef4444'
                      }}>
                        {isReceive ? '+' : '-'}{parseFloat(ethers.formatEther(tx.value)).toFixed(4)}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{textAlign: 'center', padding: '40px', color: 'gray', fontSize: 13}}>
                  {web3Address ? "Chưa có giao dịch nào." : "Vui lòng kết nối ví."}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}