import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; 
import API from '../api/api';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // <--- 1. NHỚ IMPORT useLocation
import { toast } from 'react-toastify';
import './Send.css';

export default function Send() {
  const navigate = useNavigate();
  const location = useLocation(); // <--- 2. KHAI BÁO HOOK
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // State cho danh bạ & gợi ý
  const [contacts, setContacts] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 

  // --- EFFECT 1: XỬ LÝ THEME (GIAO DIỆN) ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- EFFECT 2: XỬ LÝ GỬI NHANH TỪ DANH BẠ (QUICK SEND) ---
  useEffect(() => {
    // Kiểm tra xem có dữ liệu gửi từ trang AddressBook sang không
    if (location.state && location.state.prefillAddress) {
      setRecipient(location.state.prefillAddress); // Tự điền vào ô input
      toast.info(`Đã chọn người nhận: ${location.state.prefillAddress.slice(0,6)}...`);
    }
  }, [location]);

  // --- EFFECT 3: TẢI DANH BẠ ---
  useEffect(() => {
    const loadContacts = async () => {
      const userLocal = JSON.parse(localStorage.getItem('user'));
      if (userLocal) {
        try {
          const res = await API.get(`/user/contacts?userId=${userLocal._id}`);
          setContacts(res.data);
        } catch (err) {
          console.error("Lỗi tải danh bạ", err);
        }
      }
    };
    loadContacts();
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // ... (Giữ nguyên các hàm handleSelectContact, handleSend, handlePaste...) ...
  // (Phần code bên dưới không thay đổi so với phiên bản trước)

  // Hàm lọc danh bạ
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(recipient.toLowerCase()) && 
    recipient.length > 0 &&
    recipient !== c.address
  );

  const handleSelectContact = (address) => {
    setRecipient(address);
    setShowSuggestions(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient || !amount) return toast.warning("Nhập đủ thông tin!");
    if (!window.ethereum) return toast.error("Cài MetaMask đi bạn ơi!");

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const txAmount = ethers.parseEther(amount.toString());

      const tx = await signer.sendTransaction({ to: recipient, value: txAmount });

      toast.info("⏳ Giao dịch đã gửi đi...");
      await tx.wait(); 

      await API.post('/wallets/transaction', {
        from: await signer.getAddress(),
        to: recipient,
        amount: Number(amount),
        hash: tx.hash, 
        token: "ETH"
      });

      toast.success("✅ Gửi tiền thành công!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error("Thất bại: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text);
      setShowSuggestions(false);
    } catch (err) { toast.error("Lỗi Clipboard"); }
  };

  const handleMax = () => { toast.info("Tính năng Max đang phát triển"); };

  return (
    <div className="send-container">
      <div className="send-card">
        <div className="send-header">
          <h2>Gửi Crypto (REAL)</h2>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="form-group" style={{position: 'relative'}}>
            <label className="form-label">Người nhận (Tên hoặc Địa chỉ)</label>
            <div className="input-wrapper">
              <input 
                className="form-input" 
                type="text" 
                placeholder="Nhập tên hoặc 0x..." 
                value={recipient} 
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                required
                autoComplete="off"
              />
              <button type="button" className="input-action-btn" onClick={handlePaste}>DÁN</button>
            </div>

            {/* Gợi ý danh bạ */}
            {showSuggestions && filteredContacts.length > 0 && (
              <div className="suggestions-list">
                {filteredContacts.map(c => (
                  <div key={c._id} className="suggestion-item" onClick={() => handleSelectContact(c.address)}>
                    <span className="sug-name">{c.name}</span>
                    <span className="sug-address">{c.address.slice(0, 6)}...</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Số tiền (ETH)</label>
            <div className="input-wrapper">
              <input 
                className="form-input" type="number" placeholder="0.00" 
                value={amount} onChange={(e) => setAmount(e.target.value)} 
                step="0.000000000000000001" min="0" required
              />
              <button type="button" className="input-action-btn" onClick={handleMax}>TỐI ĐA</button>
            </div>
          </div>

          <button className="send-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận gửi tiền"}
          </button>
        </form>

        <Link to="/dashboard" className="back-link">← Quay lại Dashboard</Link>
      </div>
    </div>
  );
}